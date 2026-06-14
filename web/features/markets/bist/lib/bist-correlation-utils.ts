import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";
import { pearsonCorrelation } from "@/features/markets/nasdaq/lib/nasdaq-correlation-utils";

import {
  isBistIndexSymbol,
  normalizeBistSymbol,
  yahooTickerFor,
} from "@/features/markets/bist/lib/bist-symbol-meta";

export { betaLabel, computeBeta } from "@/features/markets/nasdaq/lib/nasdaq-correlation-utils";

const XU100_TICKER = "XU100.IS";
const MIN_RETURN_POINTS = 20;
const DEFAULT_LOOKBACK_DAYS = 60;

function clampCorrelation(value: number): number {
  return Number(Math.min(0.99, Math.max(-0.99, value)).toFixed(2));
}

export function xu100CorrelationLabel(corr: number): string {
  if (corr >= 0.75) return "XU100 ile güçlü pozitif";
  if (corr >= 0.45) return "XU100 ile pozitif";
  if (corr <= -0.25) return "XU100 ile negatif";
  return "XU100 ile zayıf";
}

export function computeXu100Correlation(stockCloses: number[], indexCloses: number[]): number | null {
  if (stockCloses.length < 10 || indexCloses.length < 10) return null;
  const len = Math.min(stockCloses.length, indexCloses.length);
  const s = stockCloses.slice(-len);
  const b = indexCloses.slice(-len);
  const stockRet: number[] = [];
  const indexRet: number[] = [];
  for (let i = 1; i < len; i++) {
    const prevS = s[i - 1]!;
    const curS = s[i]!;
    const prevB = b[i - 1]!;
    const curB = b[i]!;
    if (prevS > 0 && prevB > 0) {
      stockRet.push((curS - prevS) / prevS);
      indexRet.push((curB - prevB) / prevB);
    }
  }
  if (stockRet.length < 10) return null;
  return pearsonCorrelation(stockRet, indexRet);
}

export function defaultXu100Correlation(symbol: string, isIndex: boolean): number {
  if (isIndex) return 0.95;
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  if (/GARAN|AKBNK|YKBNK|ISCTR|HALKB|VAKBN/.test(sym)) return 0.82;
  if (/THYAO|PGSUS|TOASO|FROTO/.test(sym)) return 0.71;
  if (/ASELS|LOGO/.test(sym)) return 0.64;
  return 0.74;
}

export async function computeXu100CorrelationFromYahoo(
  symbol: string,
  lookbackDays = DEFAULT_LOOKBACK_DAYS,
): Promise<{ correlation: number; label: string }> {
  const sym = normalizeBistSymbol(symbol);
  const isIndex = isBistIndexSymbol(sym);

  if (isIndex) {
    const correlation = 0.95;
    return { correlation, label: xu100CorrelationLabel(correlation) };
  }

  const stockTicker = yahooTickerFor(sym);
  const yahooRange = lookbackDays <= 35 ? "3mo" : "6mo";

  const [stockDaily, indexDaily] = await Promise.all([
    fetchYahooChart(stockTicker, "1d", yahooRange),
    fetchYahooChart(XU100_TICKER, "1d", yahooRange),
  ]);

  if (!stockDaily?.length || !indexDaily?.length) {
    const fallback = defaultXu100Correlation(sym, false);
    return { correlation: fallback, label: xu100CorrelationLabel(fallback) };
  }

  const window = Math.min(stockDaily.length, indexDaily.length, lookbackDays + 1);
  const stockCloses = stockDaily.slice(-window).map((k) => k.close);
  const indexCloses = indexDaily.slice(-window).map((k) => k.close);
  const corr = computeXu100Correlation(stockCloses, indexCloses);

  if (corr == null || !Number.isFinite(corr)) {
    const fallback = defaultXu100Correlation(sym, false);
    return { correlation: fallback, label: xu100CorrelationLabel(fallback) };
  }

  const correlation = clampCorrelation(corr);
  if (stockCloses.length < MIN_RETURN_POINTS) {
    const fallback = defaultXu100Correlation(sym, false);
    return { correlation: fallback, label: xu100CorrelationLabel(fallback) };
  }

  return { correlation, label: xu100CorrelationLabel(correlation) };
}
