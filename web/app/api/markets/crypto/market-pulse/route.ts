import { NextResponse } from "next/server";

import { fetchMarketPulse } from "@/features/markets/crypto/lib/build-market-pulse";
import { parseCryptoSymbol, usdtPair } from "@/features/markets/crypto/lib/binance-spot";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCryptoSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const pair = usdtPair(symbol);
  const payload = await fetchMarketPulse(symbol, pair);

  if (!payload) {
    return NextResponse.json({ error: "Piyasa pulse verisi bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
