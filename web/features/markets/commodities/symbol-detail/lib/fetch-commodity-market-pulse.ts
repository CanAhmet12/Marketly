import type { CommodityMarketPulseResponse } from "@/features/markets/commodities/lib/commodity-detail-types";

export async function fetchCommodityDetailMarketPulse(
  symbol: string,
  changePct?: number,
): Promise<CommodityMarketPulseResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });
  if (changePct != null && Number.isFinite(changePct)) {
    params.set("changePct", String(changePct));
  }

  const res = await fetch(`/api/markets/commodities/market-pulse?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Emtia pulse verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CommodityMarketPulseResponse>;
}
