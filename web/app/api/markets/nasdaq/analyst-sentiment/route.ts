import { NextResponse } from "next/server";

import { fetchNasdaqAnalystSentiment } from "@/features/markets/nasdaq/lib/build-nasdaq-analyst-sentiment";
import { parseNasdaqSymbol } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseNasdaqSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchNasdaqAnalystSentiment(symbol);

  if (!payload) {
    return NextResponse.json({ error: "Analist sentiment verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
