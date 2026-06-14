import { NextResponse } from "next/server";

import { fetchNasdaqSparkline } from "@/features/markets/nasdaq/lib/build-nasdaq-sparkline";
import {
  NASDAQ_SPARKLINE_RANGES,
  type NasdaqSparklineRange,
} from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import { parseNasdaqSymbol } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";

export const dynamic = "force-dynamic";

function parseRange(raw: string | null): NasdaqSparklineRange {
  if (raw && NASDAQ_SPARKLINE_RANGES.includes(raw as NasdaqSparklineRange)) {
    return raw as NasdaqSparklineRange;
  }
  return "1mo";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseNasdaqSymbol(searchParams.get("symbol"));
  const range = parseRange(searchParams.get("range"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchNasdaqSparkline(symbol, range);

  if (!payload) {
    return NextResponse.json({ error: "Sparkline verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=90",
    },
  });
}
