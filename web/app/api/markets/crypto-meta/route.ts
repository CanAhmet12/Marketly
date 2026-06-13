import { NextResponse } from "next/server";

import { resolveCoingeckoId } from "@/features/markets/crypto/detail/lib/coingecko-ids";
import type { CryptoCoinMeta } from "@/features/markets/crypto/detail/lib/crypto-detail-stats-types";

export const runtime = "nodejs";
export const revalidate = 300;

function fallbackMeta(price: number, sparkMax?: number): CryptoCoinMeta {
  const ath = sparkMax && sparkMax > price ? sparkMax : price * 1.18;
  return {
    source: "fallback",
    ath,
    athChangePct: ath > 0 ? ((price - ath) / ath) * 100 : -15,
    circulatingSupply: null,
    maxSupply: null,
    totalSupply: null,
    fdv: null,
    marketCapUsd: null,
    volume24hUsd: null,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") ?? "").trim().toUpperCase();
  const price = Number(searchParams.get("price") ?? "0");
  const sparkMax = Number(searchParams.get("sparkMax") ?? "0");

  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const cgId = resolveCoingeckoId(symbol);
  if (!cgId) {
    return NextResponse.json(fallbackMeta(price, sparkMax || undefined));
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${cgId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) {
      return NextResponse.json(fallbackMeta(price, sparkMax || undefined));
    }

    const data = (await res.json()) as {
      market_data?: {
        ath?: { usd?: number };
        ath_change_percentage?: { usd?: number };
        circulating_supply?: number;
        max_supply?: number | null;
        total_supply?: number | null;
        fully_diluted_valuation?: { usd?: number };
        market_cap?: { usd?: number };
        total_volume?: { usd?: number };
      };
    };

    const md = data.market_data;
    if (!md) {
      return NextResponse.json(fallbackMeta(price, sparkMax || undefined));
    }

    const payload: CryptoCoinMeta = {
      source: "coingecko",
      ath: md.ath?.usd ?? null,
      athChangePct: md.ath_change_percentage?.usd ?? null,
      circulatingSupply: md.circulating_supply ?? null,
      maxSupply: md.max_supply ?? null,
      totalSupply: md.total_supply ?? null,
      fdv: md.fully_diluted_valuation?.usd ?? null,
      marketCapUsd: md.market_cap?.usd ?? null,
      volume24hUsd: md.total_volume?.usd ?? null,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(fallbackMeta(price, sparkMax || undefined));
  }
}
