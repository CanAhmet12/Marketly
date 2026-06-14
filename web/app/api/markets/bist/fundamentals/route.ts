import { NextResponse } from "next/server";

import { buildBistFundamentals } from "@/features/markets/bist/lib/build-bist-fundamentals";
import { parseBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseBistSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const name = searchParams.get("name") ?? undefined;
  const payload = await buildBistFundamentals(symbol, name ?? undefined);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
