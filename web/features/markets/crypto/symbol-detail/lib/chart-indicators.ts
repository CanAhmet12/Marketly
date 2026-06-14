import type { DetailKline } from "@/features/markets/crypto/symbol-detail/lib/types";
import type { Time } from "lightweight-charts";

export function calcEma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    if (prev === null) {
      const slice = values.slice(0, period);
      prev = slice.reduce((acc, v) => acc + v, 0) / period;
    } else {
      prev = values[i]! * k + prev * (1 - k);
    }
    out.push(prev);
  }

  return out;
}

export function calcRsi(closes: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length <= period) return out;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i]! - closes[i - 1]!;
    avgGain += change > 0 ? change : 0;
    avgLoss += change < 0 ? -change : 0;
  }
  avgGain /= period;
  avgLoss /= period;

  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  out[period] = 100 - 100 / (1 + rs0);

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i]! - closes[i - 1]!;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    out[i] = 100 - 100 / (1 + rs);
  }

  return out;
}

export function lineSeriesFromIndicator(
  candles: DetailKline[],
  values: (number | null)[],
): { time: Time; value: number }[] {
  const out: { time: Time; value: number }[] = [];
  for (let i = 0; i < candles.length; i++) {
    const v = values[i];
    if (v == null || !Number.isFinite(v)) continue;
    out.push({ time: candles[i]!.time as Time, value: v });
  }
  return out;
}

export function calcSma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    const slice = values.slice(i - period + 1, i + 1);
    out.push(slice.reduce((acc, v) => acc + v, 0) / period);
  }
  return out;
}

export function calcBollinger(
  closes: number[],
  period = 20,
  mult = 2,
): { mid: (number | null)[]; upper: (number | null)[]; lower: (number | null)[] } {
  const mid = calcSma(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    const m = mid[i];
    if (m == null || i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    const slice = closes.slice(i - period + 1, i + 1);
    const variance = slice.reduce((acc, v) => acc + (v - m) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    upper.push(m + mult * std);
    lower.push(m - mult * std);
  }

  return { mid, upper, lower };
}

export function calcMacd(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): { macd: (number | null)[]; signal: (number | null)[]; hist: (number | null)[] } {
  const emaFast = calcEma(closes, fastPeriod);
  const emaSlow = calcEma(closes, slowPeriod);
  const macd: (number | null)[] = closes.map((_, i) => {
    if (emaFast[i] == null || emaSlow[i] == null) return null;
    return emaFast[i]! - emaSlow[i]!;
  });
  const macdNums = macd.map((v) => v ?? 0);
  const signal = calcEma(macdNums, signalPeriod);
  const hist = macd.map((m, i) => {
    if (m == null || signal[i] == null) return null;
    return m - signal[i]!;
  });
  return { macd, signal, hist };
}
