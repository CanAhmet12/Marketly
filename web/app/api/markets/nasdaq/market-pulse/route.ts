import { NextResponse } from "next/server";

import { fetchNasdaqMarketPulse } from "@/features/markets/nasdaq/lib/build-nasdaq-market-pulse";
import { parseNasdaqSymbol } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseNasdaqSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const fallbackChange = Number(searchParams.get("changePct") ?? "0");
  const payload = await fetchNasdaqMarketPulse(
    symbol,
    Number.isFinite(fallbackChange) ? fallbackChange : 0,
  );

  if (!payload) {
    return NextResponse.json({ error: "Hisse pulse verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
