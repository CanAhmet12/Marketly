import type { CommodityMacroSentimentResponse } from "@/features/markets/commodities/lib/commodity-detail-types";

export async function fetchCommodityDetailMacroSentiment(
  symbol: string,
): Promise<CommodityMacroSentimentResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/commodities/macro-sentiment?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Makro sentiment verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CommodityMacroSentimentResponse>;
}
