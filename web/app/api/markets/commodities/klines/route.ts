import { NextResponse } from "next/server";

import { fetchCommodityKlines } from "@/features/markets/commodities/lib/build-commodity-klines";
import type { CommodityChartTimeframe } from "@/features/markets/commodities/lib/commodity-chart-types";
import { COMMODITY_CHART_TIMEFRAMES } from "@/features/markets/commodities/lib/commodity-chart-types";
import { parseCommoditySymbol } from "@/features/markets/commodities/lib/commodity-symbol-meta";

export const dynamic = "force-dynamic";

function parseTimeframe(raw: string | null): CommodityChartTimeframe | null {
  if (!raw) return null;
  return COMMODITY_CHART_TIMEFRAMES.includes(raw as CommodityChartTimeframe)
    ? (raw as CommodityChartTimeframe)
    : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCommoditySymbol(searchParams.get("symbol"));
  const timeframe = parseTimeframe(searchParams.get("timeframe")) ?? "1h";

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchCommodityKlines(symbol, timeframe);

  if (!payload) {
    return NextResponse.json({ error: "Kline verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
    },
  });
}
