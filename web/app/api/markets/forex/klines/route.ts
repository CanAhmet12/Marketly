import { NextResponse } from "next/server";

import { fetchForexKlines } from "@/features/markets/forex/lib/build-forex-klines";
import {
  FOREX_CHART_TIMEFRAMES,
  type ForexChartTimeframe,
} from "@/features/markets/forex/lib/forex-chart-types";
import { parseForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";

export const dynamic = "force-dynamic";

function parseTimeframe(raw: string | null): ForexChartTimeframe | null {
  if (!raw) return null;
  return FOREX_CHART_TIMEFRAMES.includes(raw as ForexChartTimeframe)
    ? (raw as ForexChartTimeframe)
    : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseForexSymbol(searchParams.get("symbol"));
  const timeframe = parseTimeframe(searchParams.get("timeframe")) ?? "1h";

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchForexKlines(symbol, timeframe);

  if (!payload) {
    return NextResponse.json({ error: "Kline verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
    },
  });
}
