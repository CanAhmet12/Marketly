import { NextResponse } from "next/server";

import { fetchCommoditySpreadSession } from "@/features/markets/commodities/lib/build-commodity-spread-session";
import { parseCommoditySymbol } from "@/features/markets/commodities/lib/commodity-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCommoditySymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchCommoditySpreadSession(symbol);

  if (!payload) {
    return NextResponse.json({ error: "Spread/seans verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
    },
  });
}
