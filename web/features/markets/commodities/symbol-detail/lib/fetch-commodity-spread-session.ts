import type { CommoditySpreadSessionResponse } from "@/features/markets/commodities/lib/commodity-detail-types";

export async function fetchCommodityDetailSpreadSession(
  symbol: string,
): Promise<CommoditySpreadSessionResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/commodities/spread-session?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Spread/seans verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CommoditySpreadSessionResponse>;
}
