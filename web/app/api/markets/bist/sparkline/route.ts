import { NextResponse } from "next/server";

import { fetchBistSparkline } from "@/features/markets/bist/lib/build-bist-sparkline";
import {
  BIST_SPARKLINE_RANGES,
  type BistSparklineRange,
} from "@/features/markets/bist/lib/bist-chart-types";
import { parseBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";

export const dynamic = "force-dynamic";

function parseRange(raw: string | null): BistSparklineRange {
  if (raw && BIST_SPARKLINE_RANGES.includes(raw as BistSparklineRange)) {
    return raw as BistSparklineRange;
  }
  return "1mo";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseBistSymbol(searchParams.get("symbol"));
  const range = parseRange(searchParams.get("range"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchBistSparkline(symbol, range);

  if (!payload) {
    return NextResponse.json({ error: "Sparkline verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=90",
    },
  });
}
