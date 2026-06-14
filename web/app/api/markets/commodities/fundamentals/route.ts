import { NextResponse } from "next/server";

import { buildCommodityFundamentals } from "@/features/markets/commodities/lib/build-commodity-fundamentals";
import { parseCommoditySymbol } from "@/features/markets/commodities/lib/commodity-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCommoditySymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const name = searchParams.get("name") ?? undefined;
  const payload = buildCommodityFundamentals(symbol, name ?? undefined);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
