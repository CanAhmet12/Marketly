import { NextResponse } from "next/server";

import { fetchBistKlines } from "@/features/markets/bist/lib/build-bist-klines";
import {
  BIST_CHART_TIMEFRAMES,
  type BistChartTimeframe,
} from "@/features/markets/bist/lib/bist-chart-types";
import { parseBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";

export const dynamic = "force-dynamic";

function parseTimeframe(raw: string | null): BistChartTimeframe | null {
  if (!raw) return null;
  return BIST_CHART_TIMEFRAMES.includes(raw as BistChartTimeframe)
    ? (raw as BistChartTimeframe)
    : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseBistSymbol(searchParams.get("symbol"));
  const timeframe = parseTimeframe(searchParams.get("timeframe")) ?? "1h";

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchBistKlines(symbol, timeframe);

  if (!payload) {
    return NextResponse.json({ error: "Kline verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
    },
  });
}
