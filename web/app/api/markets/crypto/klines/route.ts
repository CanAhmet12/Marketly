import { NextResponse } from "next/server";

import type { CryptoKline, CryptoKlinesResponse } from "@/features/markets/crypto/lib/crypto-klines-types";
import { coingeckoIdForSymbol } from "@/features/markets/crypto/lib/coingecko-ids";

const BINANCE_INTERVALS = new Set([
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "6h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1M",
]);

/** CoinGecko OHLC yalnızca bu gün değerlerini kabul eder */
const CG_OHLC_DAYS = [1, 7, 14, 30, 90, 180, 365] as const;

const BINANCE_BASES = ["https://data-api.binance.vision", "https://api.binance.com"] as const;

type BinanceKlineRow = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

function parseSymbol(raw: string | null): string | null {
  if (!raw) return null;
  const sym = raw.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,12}$/.test(sym)) return null;
  return sym;
}

function parseInterval(raw: string | null): string | null {
  if (!raw || !BINANCE_INTERVALS.has(raw)) return null;
  return raw;
}

function parseLimit(raw: string | null): number {
  const n = Number(raw ?? "168");
  if (!Number.isFinite(n)) return 168;
  return Math.min(1000, Math.max(10, Math.floor(n)));
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

function snapCoinGeckoDays(needed: number): number {
  const n = Math.max(1, Math.ceil(needed));
  for (const d of CG_OHLC_DAYS) {
    if (d >= n) return d;
  }
  return 365;
}

function intervalToCgDays(interval: string, limit: number): number {
  if (interval.endsWith("m")) {
    const mins = Number(interval.replace("m", "")) || 15;
    return snapCoinGeckoDays((mins * limit) / (60 * 24));
  }
  if (interval.endsWith("h")) {
    const hrs = Number(interval.replace("h", "")) || 1;
    return snapCoinGeckoDays((hrs * limit) / 24);
  }
  if (interval === "1d" || interval === "3d") return snapCoinGeckoDays(limit);
  if (interval === "1w") return snapCoinGeckoDays(limit * 7);
  return 30;
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
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        next: { revalidate: 30 },
      });

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

async function fetchCoinGeckoKlines(
  symbol: string,
  interval: string,
  limit: number,
): Promise<CryptoKline[] | null> {
  const cgId = coingeckoIdForSymbol(symbol);
  if (!cgId) return null;

  const days = intervalToCgDays(interval, limit);
  const url = `https://api.coingecko.com/api/v3/coins/${cgId}/ohlc?vs_currency=usd&days=${days}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 120 },
  });

  if (!res.ok) return null;

  const rows = (await res.json()) as [number, number, number, number, number][];
  if (!Array.isArray(rows) || rows.length === 0) return null;

  return rows
    .slice(-limit)
        .map(([timestamp, open, high, low, close]) => ({
      time: Math.floor(timestamp / 1000),
      open,
      high,
      low,
      close,
      volume: 0,
    }))
    .filter((c) => c.open > 0 && c.close > 0);
}

function normalizeCandles(candles: CryptoKline[]): CryptoKline[] {
  const byTime = new Map<number, CryptoKline>();
  for (const candle of candles) {
    byTime.set(candle.time, candle);
  }
  return [...byTime.values()].sort((a, b) => a.time - b.time);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseSymbol(searchParams.get("symbol"));
  const interval = parseInterval(searchParams.get("interval"));
  const limit = parseLimit(searchParams.get("limit"));

  if (!symbol || !interval) {
    return NextResponse.json({ error: "Geçersiz sembol veya interval" }, { status: 400 });
  }

  const pair = `${symbol}USDT`;
  let candles = await fetchBinanceKlines(pair, interval, limit);
  let source: CryptoKlinesResponse["source"] = "binance";

  if (!candles?.length) {
    candles = await fetchCoinGeckoKlines(symbol, interval, limit);
    source = "coingecko";
  }

  if (!candles?.length) {
    return NextResponse.json({ error: "Kline verisi bulunamadı" }, { status: 404 });
  }

  const normalized = normalizeCandles(candles).slice(-limit);
  if (normalized.length < 2) {
    return NextResponse.json({ error: "Kline verisi bulunamadı" }, { status: 404 });
  }

  const payload: CryptoKlinesResponse = {
    symbol,
    pair,
    interval,
    source,
    candles: normalized,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
