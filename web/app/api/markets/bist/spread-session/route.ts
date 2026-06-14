import { NextResponse } from "next/server";

import { fetchBistSpreadSession } from "@/features/markets/bist/lib/build-bist-spread-session";
import { parseBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseBistSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchBistSpreadSession(symbol);

  if (!payload) {
    return NextResponse.json({ error: "Seans verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
