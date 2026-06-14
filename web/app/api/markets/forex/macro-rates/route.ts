import { NextResponse } from "next/server";

import { fetchForexMacroRates } from "@/features/markets/forex/lib/build-forex-macro-rates";
import { parseForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseForexSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchForexMacroRates(symbol);

  if (!payload) {
    return NextResponse.json({ error: "Makro faiz verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
