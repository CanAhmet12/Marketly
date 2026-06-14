import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";
import { normalizeForexSymbol, yahooTickerFor } from "@/features/markets/forex/lib/forex-symbol-meta";

export function pearsonCorrelation(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 3) return null;

  const xs = a.slice(-n);
  const ys = b.slice(-n);
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - meanX;
    const dy = ys[i]! - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den <= 0) return null;
  return num / den;
}

export function dailyReturns(closes: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1]!;
    const cur = closes[i]!;
    if (prev > 0) out.push((cur - prev) / prev);
  }
  return out;
}

export function dxySensitivityLabel(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 0.75) return "Yüksek DXY duyarlılığı";
  if (abs >= 0.45) return "Orta DXY duyarlılığı";
  if (abs >= 0.2) return "Ilımlı DXY duyarlılığı";
  return "Düşük DXY duyarlılığı";
}

export function defaultDxySensitivity(symbol: string): number {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  if (sym === "DXY") return 1;
  if (sym.endsWith("USD")) return -0.72;
  if (sym.startsWith("USD")) return 0.68;
  if (sym.includes("JPY")) return 0.35;
  return 0.25;
}

export function correlationStrength(value: number): "weak" | "moderate" | "strong" {
  const abs = Math.abs(value);
  if (abs >= 0.65) return "strong";
  if (abs >= 0.35) return "moderate";
  return "weak";
}

const DXY_TICKER = "DX-Y.NYB";
const MIN_RETURN_POINTS = 20;
const DEFAULT_LOOKBACK_DAYS = 60;

function clampCorrelation(value: number): number {
  return Number(Math.min(0.99, Math.max(-0.99, value)).toFixed(2));
}

export async function computeDxyCorrelation(
  symbol: string,
  lookbackDays = DEFAULT_LOOKBACK_DAYS,
): Promise<number> {
  const sym = normalizeForexSymbol(symbol);
  if (sym === "DXY") return 1;

  const pairTicker = yahooTickerFor(sym);
  if (!pairTicker) return defaultDxySensitivity(sym);

  const yahooRange = lookbackDays <= 35 ? "3mo" : "6mo";
  const [dxyDaily, pairDaily] = await Promise.all([
    fetchYahooChart(DXY_TICKER, "1d", yahooRange),
    fetchYahooChart(pairTicker, "1d", yahooRange),
  ]);

  if (!dxyDaily?.length || !pairDaily?.length) {
    return defaultDxySensitivity(sym);
  }

  const window = Math.min(dxyDaily.length, pairDaily.length, lookbackDays + 1);
  const dxyCloses = dxyDaily.slice(-window).map((k) => k.close);
  const pairCloses = pairDaily.slice(-window).map((k) => k.close);
  const dxyReturns = dailyReturns(dxyCloses);
  const pairReturns = dailyReturns(pairCloses);
  const aligned = Math.min(dxyReturns.length, pairReturns.length);

  if (aligned < MIN_RETURN_POINTS) {
    return defaultDxySensitivity(sym);
  }

  const corr = pearsonCorrelation(
    pairReturns.slice(-aligned),
    dxyReturns.slice(-aligned),
  );

  if (corr == null || !Number.isFinite(corr)) {
    return defaultDxySensitivity(sym);
  }

  return clampCorrelation(corr);
}
