import type { CommodityVenueComparisonResponse } from "@/features/markets/commodities/lib/commodity-detail-types";

export async function fetchCommodityDetailVenueComparison(
  symbol: string,
): Promise<CommodityVenueComparisonResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/commodities/venue-comparison?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Venue karşılaştırması alınamadı (${res.status})`);
  }

  return res.json() as Promise<CommodityVenueComparisonResponse>;
}
