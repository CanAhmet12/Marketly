import type { NasdaqAnalystSentimentResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";
import {
  correlationStrength,
  dailyReturns,
  defaultSpxCorrelationForSymbol,
  pearsonCorrelation,
  spxCorrelationLabel,
} from "@/features/markets/nasdaq/lib/nasdaq-correlation-utils";
import { fetchYahooEarningsHint } from "@/features/markets/nasdaq/lib/fetch-yahoo-earnings";
import {
  isNasdaqIndexSymbol,
  yahooTickerFor,
} from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { fetchYahooChart, fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

const SPX_TICKER = "^GSPC";
const VIX_TICKER = "^VIX";

const ANALYST_REF: Record<string, { target: string; upside: string; earnings: string; timing: "BMO" | "AMC" | "—" }> = {
  AAPL: { target: "$228", upside: "+6%", earnings: "Yakında", timing: "AMC" },
  NVDA: { target: "$145", upside: "+11%", earnings: "Yakında", timing: "AMC" },
  MSFT: { target: "$480", upside: "+8%", earnings: "Yakında", timing: "AMC" },
  TSLA: { target: "$285", upside: "+4%", earnings: "Yakında", timing: "AMC" },
  META: { target: "$620", upside: "+9%", earnings: "Yakında", timing: "AMC" },
  AMZN: { target: "$225", upside: "+7%", earnings: "Yakında", timing: "AMC" },
  NDX: { target: "—", upside: "—", earnings: "—", timing: "—" },
  SPX: { target: "—", upside: "—", earnings: "—", timing: "—" },
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function vixLabel(vix: number): string {
  if (vix >= 25) return "Risk-off";
  if (vix >= 18) return "Temkinli";
  if (vix <= 14) return "Risk-on";
  return "Ilımlı risk";
}

function spxLabel(change: number): string {
  if (change > 0.5) return "Risk-on";
  if (change > 0.1) return "Pozitif seans";
  if (change < -0.5) return "Risk-off";
  if (change < -0.1) return "Negatif seans";
  return "Nötr";
}

function sentimentLabel(score: number): string {
  if (score >= 68) return "Boğa eğilimi";
  if (score >= 45) return "Nötr sentiment";
  return "Ayı baskısı";
}

function buildHistory(scores: number[]): NasdaqAnalystSentimentResponse["history"] {
  const labels = ["6g", "5g", "4g", "3g", "2g", "1g", "Bugün"];
  const tail = scores.slice(-7);
  while (tail.length < 7) tail.unshift(tail[0] ?? 50);

  return tail.map((score, index) => ({
    label: labels[index] ?? `${index}`,
    score: clamp(Math.round(score), 8, 92),
  }));
}

async function computeSpxCorrelation(symbol: string): Promise<number> {
  const sym = symbol.trim().toUpperCase();
  const isIndex = isNasdaqIndexSymbol(sym);
  const ticker = yahooTickerFor(sym);
  if (!ticker) return defaultSpxCorrelationForSymbol(sym, isIndex);

  const [spxDaily, stockDaily] = await Promise.all([
    fetchYahooChart(SPX_TICKER, "1d", "3mo"),
    fetchYahooChart(ticker, "1d", "3mo"),
  ]);

  if (!spxDaily?.length || !stockDaily?.length) {
    return defaultSpxCorrelationForSymbol(sym, isIndex);
  }

  const corr = pearsonCorrelation(
    dailyReturns(spxDaily.map((k) => k.close)),
    dailyReturns(stockDaily.map((k) => k.close)),
  );

  if (corr == null || !Number.isFinite(corr)) {
    return defaultSpxCorrelationForSymbol(sym, isIndex);
  }

  return clamp(corr, -0.99, 0.99);
}

export async function fetchNasdaqAnalystSentiment(
  symbol: string,
): Promise<NasdaqAnalystSentimentResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const ref = ANALYST_REF[sym] ?? {
    target: "—",
    upside: "+6%",
    earnings: "Yakında",
    timing: "AMC" as const,
  };

  const [spxQuote, vixQuote, spxHourly, corr, earningsHint] = await Promise.all([
    fetchYahooQuote(SPX_TICKER),
    fetchYahooQuote(VIX_TICKER),
    fetchYahooChart(SPX_TICKER, "1h", "7d"),
    computeSpxCorrelation(sym),
    isNasdaqIndexSymbol(sym) ? Promise.resolve(null) : fetchYahooEarningsHint(sym),
  ]);

  if (!spxQuote || !vixQuote) return null;

  const riskScore = clamp(100 - vixQuote.price * 2.8, 10, 90);
  const marketScore = clamp(50 + spxQuote.change24hPct * 8, 8, 92);
  const corrBoost = corr > 0.5 ? 6 : corr < 0.2 ? -4 : 0;
  const sentimentValue = clamp(Math.round((riskScore + marketScore + 50 + corrBoost) / 3), 8, 92);

  const historyScores =
    spxHourly?.map((k) =>
      clamp(50 + ((k.close - (spxHourly[0]?.close ?? k.close)) / (spxHourly[0]?.close || 1)) * 400, 8, 92),
    ) ?? Array.from({ length: 7 }, (_, i) => clamp(sentimentValue - (6 - i) * 2, 8, 92));

  return {
    symbol: sym,
    source: "yahoo",
    updatedAt: Date.now(),
    priceTarget: {
      avg: ref.target,
      upside: ref.upside,
      label: ref.target === "—" ? "Endeks — PT yok" : "Konsensüs PT",
    },
    earnings: {
      date: earningsHint?.date ?? ref.earnings,
      timing: earningsHint?.timing ?? ref.timing,
      label:
        earningsHint?.date || ref.earnings !== "—"
          ? "Kazanç takvimi"
          : "Endeks bileşeni yok",
    },
    spx: {
      value: spxQuote.price,
      change24hPct: spxQuote.change24hPct,
      label: spxLabel(spxQuote.change24hPct),
    },
    vix: {
      value: vixQuote.price,
      change24hPct: vixQuote.change24hPct,
      label: vixLabel(vixQuote.price),
    },
    correlation: {
      spxCorrelation: corr,
      label: spxCorrelationLabel(corr),
      strength: correlationStrength(corr),
    },
    sentimentScore: {
      value: sentimentValue,
      label: sentimentLabel(sentimentValue),
    },
    history: buildHistory(historyScores),
  };
}
