import type { CommodityFundamentalsResponse } from "@/features/markets/commodities/lib/commodity-detail-types";

export async function fetchCommodityDetailFundamentals(
  symbol: string,
  name?: string,
): Promise<CommodityFundamentalsResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });
  if (name?.trim()) params.set("name", name.trim());

  const res = await fetch(`/api/markets/commodities/fundamentals?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Arz & mevsim verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CommodityFundamentalsResponse>;
}
