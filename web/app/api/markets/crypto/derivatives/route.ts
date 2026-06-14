import { NextResponse } from "next/server";

import { fetchBinanceDerivatives } from "@/features/markets/crypto/lib/build-binance-derivatives";
import { fetchBybitDerivatives } from "@/features/markets/crypto/lib/bybit-futures";
import { fetchOkxDerivatives } from "@/features/markets/crypto/lib/okx-futures";
import { parseCryptoSymbol, usdtPair } from "@/features/markets/crypto/lib/binance-spot";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCryptoSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const pair = usdtPair(symbol);

  const providers = [
    fetchOkxDerivatives,
    fetchBybitDerivatives,
    fetchBinanceDerivatives,
  ] as const;

  for (const load of providers) {
    const payload = await load(symbol, pair);
    if (payload) {
      return NextResponse.json(payload, {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
        },
      });
    }
  }

  return NextResponse.json({ error: "Türev verisi bulunamadı" }, { status: 404 });
}
