import { NextResponse } from "next/server";

import { fetchNasdaqKlines } from "@/features/markets/nasdaq/lib/build-nasdaq-klines";
import {
  NASDAQ_CHART_TIMEFRAMES,
  type NasdaqChartTimeframe,
} from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import { parseNasdaqSymbol } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";

export const dynamic = "force-dynamic";

function parseTimeframe(raw: string | null): NasdaqChartTimeframe | null {
  if (!raw) return null;
  return NASDAQ_CHART_TIMEFRAMES.includes(raw as NasdaqChartTimeframe)
    ? (raw as NasdaqChartTimeframe)
    : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseNasdaqSymbol(searchParams.get("symbol"));
  const timeframe = parseTimeframe(searchParams.get("timeframe")) ?? "1h";

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchNasdaqKlines(symbol, timeframe);

  if (!payload) {
    return NextResponse.json({ error: "Kline verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
    },
  });
}
