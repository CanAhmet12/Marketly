import { NextResponse } from "next/server";

import { fetchForexMacroSentiment } from "@/features/markets/forex/lib/build-forex-macro-sentiment";
import { parseForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseForexSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchForexMacroSentiment(symbol);

  if (!payload) {
    return NextResponse.json({ error: "Makro sentiment verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
