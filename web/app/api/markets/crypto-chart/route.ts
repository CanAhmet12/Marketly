import { NextResponse } from "next/server";

import { fallbackCandleCount, generateFallbackCandles } from "@/features/markets/crypto/detail/lib/crypto-chart-fallback";
import { resolveCoingeckoId } from "@/features/markets/crypto/detail/lib/coingecko-ids";
import type { CryptoChartCandle } from "@/features/markets/crypto/detail/lib/crypto-chart-types";

export const runtime = "nodejs";
export const revalidate = 120;

type OhlcRow = [number, number, number, number, number];

function parseDays(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 7;
  return Math.min(365, Math.max(1, Math.round(n)));
}

function attachVolumes(candles: CryptoChartCandle[], volumes: [number, number][]): CryptoChartCandle[] {
  if (!volumes.length) return candles;
  return candles.map((c) => {
    let best = volumes[0]!;
    let bestDelta = Math.abs(best[0] - c.timestamp);
    for (const row of volumes) {
      const delta = Math.abs(row[0] - c.timestamp);
      if (delta < bestDelta) {
        best = row;
        bestDelta = delta;
      }
    }
    return { ...c, volume: best[1] ?? 0 };
  });
}

async function fetchCoingeckoCandles(cgId: string, days: number): Promise<CryptoChartCandle[] | null> {
  const [ohlcRes, chartRes] = await Promise.all([
    fetch(`https://api.coingecko.com/api/v3/coins/${cgId}/ohlc?vs_currency=usd&days=${days}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    }),
    fetch(`https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=${days}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    }),
  ]);

  if (!ohlcRes.ok) return null;
  const ohlc = (await ohlcRes.json()) as OhlcRow[];
  if (!Array.isArray(ohlc) || ohlc.length < 3) return null;

  let volumes: [number, number][] = [];
  if (chartRes.ok) {
    const chartJson = (await chartRes.json()) as { total_volumes?: [number, number][] };
    volumes = chartJson.total_volumes ?? [];
  }

  const candles: CryptoChartCandle[] = ohlc.map(([timestamp, open, high, low, close]) => ({
    timestamp,
    open,
    high,
    low,
    close,
    volume: 0,
  }));

  return attachVolumes(candles, volumes);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") ?? "").trim().toUpperCase();
  const days = parseDays(searchParams.get("days"));
  const price = Number(searchParams.get("price") ?? "0");
  const change = Number(searchParams.get("change") ?? "0");

  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const cgId = resolveCoingeckoId(symbol);
  let candles: CryptoChartCandle[] | null = null;
  let source: "coingecko" | "fallback" = "fallback";

  if (cgId) {
    try {
      candles = await fetchCoingeckoCandles(cgId, days);
      if (candles && candles.length >= 3) source = "coingecko";
    } catch {
      candles = null;
    }
  }

  if (!candles || candles.length < 3) {
    const seed = (price || 1) * 7 + symbol.charCodeAt(0);
    candles = generateFallbackCandles(
      price > 0 ? price : 100,
      Number.isFinite(change) ? change : 0,
      fallbackCandleCount(days),
      seed + days,
    );
    source = "fallback";
  }

  return NextResponse.json({
    symbol,
    days,
    source,
    candles,
  });
}
