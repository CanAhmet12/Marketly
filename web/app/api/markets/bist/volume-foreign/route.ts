import { NextResponse } from "next/server";

import { fetchBistVolumeForeign } from "@/features/markets/bist/lib/build-bist-volume-foreign";
import { parseBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseBistSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const fallbackChange = Number(searchParams.get("changePct") ?? "0");
  const payload = await fetchBistVolumeForeign(
    symbol,
    Number.isFinite(fallbackChange) ? fallbackChange : 0,
  );

  if (!payload) {
    return NextResponse.json({ error: "Hacim verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
