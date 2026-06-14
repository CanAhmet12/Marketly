import type { CryptoKline } from "@/features/markets/crypto/lib/crypto-klines-types";
import type { CryptoMarketPulseResponse } from "@/features/markets/crypto/lib/crypto-market-pulse-types";
import { coingeckoIdForSymbol } from "@/features/markets/crypto/lib/coingecko-ids";

const BINANCE_BASES = ["https://data-api.binance.vision", "https://api.binance.com"] as const;

type BinanceKlineRow = [number, string, string, string, string, string, number, string, number, string, string, string];

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

function mapBinanceRows(rows: BinanceKlineRow[]): CryptoKline[] {
  return rows
    .map((row) => ({
      time: Math.floor(row[0] / 1000),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5]),
    }))
    .filter((c) => c.open > 0 && c.close > 0 && c.high >= c.low);
}

async function fetchBinanceKlines(
  pair: string,
  interval: string,
  limit: number,
): Promise<CryptoKline[] | null> {
  for (const base of BINANCE_BASES) {
    const url = new URL(`${base}/api/v3/klines`);
    url.searchParams.set("symbol", pair);
    url.searchParams.set("interval", interval);
    url.searchParams.set("limit", String(limit));

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5_000);
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const rows = (await res.json()) as BinanceKlineRow[];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const mapped = mapBinanceRows(rows);
      if (mapped.length > 0) return mapped;
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchCoinGeckoDaily(symbol: string, days: number): Promise<CryptoKline[] | null> {
  const cgId = coingeckoIdForSymbol(symbol);
  if (!cgId) return null;

  const url = `https://api.coingecko.com/api/v3/coins/${cgId}/ohlc?vs_currency=usd&days=${days}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as [number, number, number, number, number][];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map(([timestamp, open, high, low, close]) => ({
      time: Math.floor(timestamp / 1000),
      open,
      high,
      low,
      close,
      volume: 0,
    }));
  } catch {
    return null;
  }
}

function buildFromKlines(
  symbol: string,
  pair: string,
  source: "binance" | "coingecko",
  hourly: CryptoKline[],
  daily: CryptoKline[],
): CryptoMarketPulseResponse | null {
  if (hourly.length < 2 && daily.length < 2) return null;

  const h = hourly.length > 0 ? hourly : daily;
  const d = daily.length > 0 ? daily : hourly;
  const current = h[h.length - 1]!.close;
  if (!Number.isFinite(current) || current <= 0) return null;

  const h1 = h.length >= 2 ? pctChange(current, h[h.length - 2]!.close) : 0;
  const h24 =
    h.length >= 25
      ? pctChange(current, h[h.length - 25]!.close)
      : h.length >= 2
        ? pctChange(current, h[0]!.open)
        : 0;

  const d7 = d.length >= 8 ? pctChange(current, d[d.length - 8]!.close) : 0;
  const d30 = d.length >= 31 ? pctChange(current, d[d.length - 31]!.close) : 0;
  const d90 = d.length >= 91 ? pctChange(current, d[d.length - 91]!.close) : pctChange(current, d[0]!.close);

  const recentHourly = h.slice(-24);
  const rangeSource = recentHourly.length >= 2 ? recentHourly : h;
  const high24 = Math.max(...rangeSource.map((c) => c.high));
  const low24 = Math.min(...rangeSource.map((c) => c.low));
  const mid24 = (high24 + low24) / 2;
  const positionPct =
    high24 > low24 ? Math.min(100, Math.max(0, ((current - low24) / (high24 - low24)) * 100)) : 50;
  const volatility24hPct = mid24 > 0 ? ((high24 - low24) / mid24) * 100 : 0;

  const recentDaily = d.slice(-14);
  const support = Math.min(...recentDaily.map((c) => c.low));
  const resistance = Math.max(...recentDaily.map((c) => c.high));
  const pivot = (high24 + low24 + current) / 3;

  return {
    symbol,
    pair,
    source,
    updatedAt: Date.now(),
    currentPrice: current,
    returns: [
      { key: "1h", label: "1s", changePct: h1 },
      { key: "24h", label: "24s", changePct: h24 },
      { key: "7d", label: "7g", changePct: d7 },
      { key: "30d", label: "30g", changePct: d30 },
      { key: "90d", label: "90g", changePct: d90 },
    ],
    range24h: { high: high24, low: low24, positionPct },
    volatility24hPct,
    levels: { support, resistance, pivot },
  };
}

export async function fetchMarketPulse(symbol: string, pair: string): Promise<CryptoMarketPulseResponse | null> {
  const [hourly, daily] = await Promise.all([
    fetchBinanceKlines(pair, "1h", 48),
    fetchBinanceKlines(pair, "1d", 92),
  ]);

  if (hourly?.length || daily?.length) {
    return buildFromKlines(symbol, pair, "binance", hourly ?? [], daily ?? []);
  }

  const cgDaily = await fetchCoinGeckoDaily(symbol, 90);
  if (!cgDaily?.length) return null;

  return buildFromKlines(symbol, pair, "coingecko", [], cgDaily);
}
