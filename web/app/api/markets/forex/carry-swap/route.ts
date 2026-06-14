import { NextResponse } from "next/server";

import { fetchForexCarrySwap } from "@/features/markets/forex/lib/build-forex-carry-swap";
import { parseForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseForexSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchForexCarrySwap(symbol);

  if (!payload) {
    return NextResponse.json({ error: "Carry/swap verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
