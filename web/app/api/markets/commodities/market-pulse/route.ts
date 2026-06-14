import { NextResponse } from "next/server";

import { fetchCommodityMarketPulse } from "@/features/markets/commodities/lib/build-commodity-market-pulse";
import { parseCommoditySymbol } from "@/features/markets/commodities/lib/commodity-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCommoditySymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const fallbackChange = Number(searchParams.get("changePct") ?? "0");
  const payload = await fetchCommodityMarketPulse(
    symbol,
    Number.isFinite(fallbackChange) ? fallbackChange : 0,
  );

  if (!payload) {
    return NextResponse.json({ error: "Emtia pulse verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
