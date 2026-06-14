import { NextResponse } from "next/server";

import { fetchForexSparkline } from "@/features/markets/forex/lib/build-forex-sparkline";
import {
  FOREX_SPARKLINE_RANGES,
  type ForexSparklineRange,
} from "@/features/markets/forex/lib/forex-chart-types";
import { parseForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";

export const dynamic = "force-dynamic";

function parseRange(raw: string | null): ForexSparklineRange {
  if (raw && FOREX_SPARKLINE_RANGES.includes(raw as ForexSparklineRange)) {
    return raw as ForexSparklineRange;
  }
  return "1mo";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseForexSymbol(searchParams.get("symbol"));
  const range = parseRange(searchParams.get("range"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchForexSparkline(symbol, range);

  if (!payload) {
    return NextResponse.json({ error: "Sparkline verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=90",
    },
  });
}
