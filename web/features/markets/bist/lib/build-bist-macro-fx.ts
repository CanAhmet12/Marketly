import type { BistMacroFxResponse } from "@/features/markets/bist/lib/bist-detail-types";
import { computeXu100Correlation } from "@/features/markets/bist/lib/bist-correlation-utils";
import {
  isBistIndexSymbol,
  normalizeBistSymbol,
  yahooTickerFor,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchYahooChart, fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

const USDTRY_TICKER = "USDTRY=X";
const EURTRY_TICKER = "EURTRY=X";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function usdLabel(change: number): string {
  if (change > 0.35) return "TL baskısı";
  if (change > 0.1) return "USD güçlü";
  if (change < -0.35) return "TL güçleniyor";
  if (change < -0.1) return "USD zayıf";
  return "Nötr kur";
}

function macroScoreLabel(score: number): string {
  if (score >= 68) return "Kur baskısı";
  if (score >= 45) return "Nötr makro";
  return "Risk-on BIST";
}

function fxSensitivityLabel(beta: number): string {
  if (beta >= 0.65) return "Kura duyarlı";
  if (beta >= 0.35) return "Orta duyarlılık";
  return "Düşük duyarlılık";
}

function buildHistory(scores: number[]): BistMacroFxResponse["history"] {
  const labels = ["6g", "5g", "4g", "3g", "2g", "1g", "Bugün"];
  const tail = scores.slice(-7);
  while (tail.length < 7) tail.unshift(tail[0] ?? 50);

  return tail.map((score, index) => ({
    label: labels[index] ?? `${index}`,
    score: clamp(Math.round(score), 8, 92),
  }));
}

export async function fetchBistMacroFx(symbol: string): Promise<BistMacroFxResponse | null> {
  const sym = normalizeBistSymbol(symbol);
  const stockTicker = yahooTickerFor(sym);

  const [usdQuote, eurQuote, usdDaily, stockDaily] = await Promise.all([
    fetchYahooQuote(USDTRY_TICKER),
    fetchYahooQuote(EURTRY_TICKER),
    fetchYahooChart(USDTRY_TICKER, "1d", "1mo"),
    fetchYahooChart(stockTicker, "1d", "1mo"),
  ]);

  if (!usdQuote || !eurQuote) return null;

  let fxBeta = isBistIndexSymbol(sym) ? 0.55 : 0.42;
  if (stockDaily?.length && usdDaily?.length) {
    const corr = computeXu100Correlation(
      stockDaily.slice(-25).map((k) => k.close),
      usdDaily.slice(-25).map((k) => k.close),
    );
    if (corr != null) fxBeta = Math.abs(Number(corr.toFixed(2)));
  }

  const usdChange = usdQuote.change24hPct;
  const kurScore = clamp(50 + usdChange * 14, 8, 92);
  const sensScore = clamp(50 + fxBeta * 28, 8, 92);
  const macroValue = clamp(Math.round((kurScore + sensScore + 50) / 3), 8, 92);

  const historyScores =
    usdDaily?.slice(-7).map((k, i, arr) => {
      const first = arr[0]?.close ?? k.close;
      return clamp(50 + ((k.close - first) / (first || 1)) * 120, 8, 92);
    }) ?? [];

  return {
    symbol: sym,
    source: "yahoo",
    updatedAt: Date.now(),
    macroScore: { value: macroValue, label: macroScoreLabel(macroValue) },
    usdTry: {
      value: usdQuote.price,
      change24hPct: usdChange,
      label: usdLabel(usdChange),
    },
    eurTry: {
      value: eurQuote.price,
      change24hPct: eurQuote.change24hPct,
      label: usdLabel(eurQuote.change24hPct),
    },
    sensitivity: {
      fxBeta,
      label: fxSensitivityLabel(fxBeta),
    },
    history: buildHistory(historyScores),
  };
}
