import type { CommodityChartTimeframe } from "@/features/markets/commodities/lib/commodity-chart-types";
import type { CommodityKlinesResponse } from "@/features/markets/commodities/lib/commodity-chart-types";

export async function fetchCommodityDetailKlines(
  symbol: string,
  timeframe: CommodityChartTimeframe,
): Promise<CommodityKlinesResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym, timeframe });

  const res = await fetch(`/api/markets/commodities/klines?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Kline verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CommodityKlinesResponse>;
}
