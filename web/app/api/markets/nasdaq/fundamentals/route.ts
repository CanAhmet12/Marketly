import { NextResponse } from "next/server";

import { buildNasdaqFundamentals } from "@/features/markets/nasdaq/lib/build-nasdaq-fundamentals";
import { parseNasdaqSymbol } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseNasdaqSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const name = searchParams.get("name") ?? undefined;
  const payload = await buildNasdaqFundamentals(symbol, name ?? undefined);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
