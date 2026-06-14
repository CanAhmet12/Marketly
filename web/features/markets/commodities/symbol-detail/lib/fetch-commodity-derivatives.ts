import type { CommodityDerivativesResponse } from "@/features/markets/commodities/lib/commodity-detail-types";

export async function fetchCommodityDetailDerivatives(
  symbol: string,
): Promise<CommodityDerivativesResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/commodities/derivatives?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Vadeli verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CommodityDerivativesResponse>;
}
