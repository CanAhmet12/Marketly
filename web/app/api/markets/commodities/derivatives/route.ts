import { NextResponse } from "next/server";

import { fetchCommodityDerivatives } from "@/features/markets/commodities/lib/build-commodity-derivatives";
import { parseCommoditySymbol } from "@/features/markets/commodities/lib/commodity-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCommoditySymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchCommodityDerivatives(symbol);

  if (!payload) {
    return NextResponse.json({ error: "Vadeli verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
