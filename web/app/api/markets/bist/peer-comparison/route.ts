import { NextResponse } from "next/server";

import { fetchBistPeerComparison } from "@/features/markets/bist/lib/build-bist-peer-comparison";
import { parseBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseBistSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const payload = await fetchBistPeerComparison(symbol);

  if (!payload) {
    return NextResponse.json({ error: "Peer karşılaştırması bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
