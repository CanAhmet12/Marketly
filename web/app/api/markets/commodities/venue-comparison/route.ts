import { NextResponse } from "next/server";

import { fetchCommodityVenueComparison } from "@/features/markets/commodities/lib/build-commodity-venue-comparison";
import { parseCommoditySymbol } from "@/features/markets/commodities/lib/commodity-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCommoditySymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchCommodityVenueComparison(symbol);

  if (!payload) {
    return NextResponse.json({ error: "Venue karşılaştırması bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
