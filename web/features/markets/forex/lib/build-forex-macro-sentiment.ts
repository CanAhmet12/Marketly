import type { ForexMacroSentimentResponse } from "@/features/markets/forex/lib/forex-detail-types";
import {
  computeDxyCorrelation,
  correlationStrength,
  dxySensitivityLabel,
} from "@/features/markets/forex/lib/forex-correlation-utils";
import {
  forexPairLabel,
  normalizeForexSymbol,
  yahooTickerFor,
} from "@/features/markets/forex/lib/forex-symbol-meta";
import { fetchYahooChart, fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

const DXY_TICKER = "DX-Y.NYB";
const VIX_TICKER = "^VIX";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function dxyLabel(change: number): string {
  if (change > 0.35) return "Güçlü USD";
  if (change > 0.1) return "USD baskın";
  if (change < -0.35) return "Zayıf USD";
  if (change < -0.1) return "USD geriledi";
  return "Nötr USD";
}

function vixLabel(vix: number): string {
  if (vix >= 25) return "Risk-off";
  if (vix >= 18) return "Temkinli";
  if (vix <= 14) return "Risk-on";
  return "Ilımlı risk";
}

function macroScoreLabel(score: number): string {
  if (score >= 68) return "USD lehine";
  if (score >= 45) return "Nötr FX";
  return "Risk-on baskın";
}

function buildHistory(scores: number[]): ForexMacroSentimentResponse["history"] {
  const labels = ["6g", "5g", "4g", "3g", "2g", "1g", "Bugün"];
  const tail = scores.slice(-7);
  while (tail.length < 7) tail.unshift(tail[0] ?? 50);

  return tail.map((score, index) => ({
    label: labels[index] ?? `${index}`,
    score: clamp(Math.round(score), 8, 92),
  }));
}

export async function fetchForexMacroSentiment(
  symbol: string,
): Promise<ForexMacroSentimentResponse | null> {
  const sym = normalizeForexSymbol(symbol);
  const pair = forexPairLabel(sym);

  const [dxyQuote, vixQuote, pairHourly, sensitivity] = await Promise.all([
    fetchYahooQuote(DXY_TICKER),
    fetchYahooQuote(VIX_TICKER),
    sym === "DXY"
      ? fetchYahooChart(DXY_TICKER, "1h", "7d")
      : fetchYahooChart(yahooTickerFor(sym) ?? DXY_TICKER, "1h", "7d"),
    computeDxyCorrelation(sym, 60),
  ]);

  if (!dxyQuote || !vixQuote) return null;

  const dxyChange = dxyQuote.change24hPct;
  const riskScore = clamp(100 - vixQuote.price * 2.8, 10, 90);
  const usdScore = clamp(50 - dxyChange * 12, 8, 92);
  const sensBoost = sensitivity < 0 ? clamp(Math.abs(sensitivity) * 16, 0, 14) : -6;
  const macroValue = clamp(Math.round((riskScore + usdScore + 50 + sensBoost) / 3), 8, 92);

  const historyScores =
    pairHourly?.map((k) =>
      clamp(
        50 + ((k.close - (pairHourly[0]?.close ?? k.close)) / (pairHourly[0]?.close || 1)) * 90,
        8,
        92,
      ),
    ) ?? Array.from({ length: 7 }, (_, i) => clamp(macroValue - (6 - i) * 2, 8, 92));

  return {
    symbol: sym,
    pair,
    source: "yahoo",
    updatedAt: Date.now(),
    dxy: {
      value: dxyQuote.price,
      change24hPct: dxyChange,
      label: dxyLabel(dxyChange),
    },
    riskRegime: {
      vix: vixQuote.price,
      change24hPct: vixQuote.change24hPct,
      label: vixLabel(vixQuote.price),
    },
    correlation: {
      dxySensitivity: sensitivity,
      label: dxySensitivityLabel(sensitivity),
      strength: correlationStrength(sensitivity),
    },
    macroScore: {
      value: macroValue,
      label: macroScoreLabel(macroValue),
    },
    history: buildHistory(historyScores),
  };
}
