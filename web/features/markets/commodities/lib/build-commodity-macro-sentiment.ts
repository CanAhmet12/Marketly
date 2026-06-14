import type { CommodityMacroSentimentResponse } from "@/features/markets/commodities/lib/commodity-detail-types";
import {
  correlationStrength,
  dailyReturns,
  defaultDxyCorrelationForSymbol,
  dxyCorrelationLabel,
  pearsonCorrelation,
} from "@/features/markets/commodities/lib/commodity-correlation-utils";
import { resolveCommodityCategory } from "@/features/markets/commodities/lib/commodity-regime-utils";
import { yahooTickerFor } from "@/features/markets/commodities/lib/commodity-symbol-meta";
import { fetchYahooChart, fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

const DXY_TICKER = "DX-Y.NYB";
const VIX_TICKER = "^VIX";
const TNX_TICKER = "^TNX";

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

function inflationLabel(yield10y: number): string {
  if (yield10y >= 4.5) return "Sıkı faiz baskısı";
  if (yield10y >= 3.8) return "Yüksek nominal";
  if (yield10y <= 3.2) return "Gevşek koşullar";
  return "Orta seviye";
}

function macroScoreLabel(score: number): string {
  if (score >= 68) return "Emtia lehine";
  if (score >= 45) return "Nötr makro";
  return "USD baskın";
}

function buildHistory(dxySeries: number[]): CommodityMacroSentimentResponse["history"] {
  const labels = ["6g", "5g", "4g", "3g", "2g", "1g", "Bugün"];
  const tail = dxySeries.slice(-7);
  while (tail.length < 7) tail.unshift(tail[0] ?? 50);

  return tail.map((score, index) => ({
    label: labels[index] ?? `${index}`,
    score: clamp(Math.round(score), 8, 92),
  }));
}

async function computeDxyCorrelation(symbol: string, category: string): Promise<number> {
  const commodityTicker = yahooTickerFor(symbol);
  if (!commodityTicker) return defaultDxyCorrelationForSymbol(symbol, category);

  const [dxyDaily, commodityDaily] = await Promise.all([
    fetchYahooChart(DXY_TICKER, "1d", "3mo"),
    fetchYahooChart(commodityTicker, "1d", "3mo"),
  ]);

  if (!dxyDaily?.length || !commodityDaily?.length) {
    return defaultDxyCorrelationForSymbol(symbol, category);
  }

  const dxyReturns = dailyReturns(dxyDaily.map((k) => k.close));
  const commodityReturns = dailyReturns(commodityDaily.map((k) => k.close));
  const corr = pearsonCorrelation(dxyReturns, commodityReturns);

  if (corr == null || !Number.isFinite(corr)) {
    return defaultDxyCorrelationForSymbol(symbol, category);
  }

  return clamp(corr, -0.99, 0.99);
}

export async function fetchCommodityMacroSentiment(
  symbol: string,
): Promise<CommodityMacroSentimentResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const category = resolveCommodityCategory(sym);

  const [dxyQuote, vixQuote, tnxQuote, dxyHourly, corr] = await Promise.all([
    fetchYahooQuote(DXY_TICKER),
    fetchYahooQuote(VIX_TICKER),
    fetchYahooQuote(TNX_TICKER),
    fetchYahooChart(DXY_TICKER, "1h", "7d"),
    computeDxyCorrelation(sym, category),
  ]);

  if (!dxyQuote || !vixQuote) return null;

  const dxyChange = dxyQuote.change24hPct;
  const inflationValue = tnxQuote?.price ?? 4.1;
  const riskScore = clamp(100 - vixQuote.price * 2.8, 10, 90);
  const usdScore = clamp(50 - dxyChange * 12, 8, 92);
  const corrBoost = corr < 0 ? clamp(Math.abs(corr) * 18, 0, 16) : -8;
  const macroValue = clamp(Math.round((riskScore + usdScore + 50 + corrBoost) / 3), 8, 92);

  const historyScores =
    dxyHourly?.map((k) =>
      clamp(50 - ((k.close - (dxyHourly[0]?.close ?? k.close)) / (dxyHourly[0]?.close || 1)) * 120, 8, 92),
    ) ?? Array.from({ length: 7 }, (_, i) => clamp(macroValue - (6 - i) * 2, 8, 92));

  return {
    symbol: sym,
    source: "yahoo",
    updatedAt: Date.now(),
    dxy: {
      value: dxyQuote.price,
      change24hPct: dxyChange,
      label: dxyLabel(dxyChange),
    },
    riskAppetite: {
      vix: vixQuote.price,
      change24hPct: vixQuote.change24hPct,
      label: vixLabel(vixQuote.price),
    },
    inflationProxy: {
      value: inflationValue,
      label: inflationLabel(inflationValue),
    },
    correlation: {
      dxyCorrelation: corr,
      label: dxyCorrelationLabel(corr, category),
      strength: correlationStrength(corr),
    },
    macroScore: {
      value: macroValue,
      label: macroScoreLabel(macroValue),
    },
    history: buildHistory(historyScores),
  };
}
