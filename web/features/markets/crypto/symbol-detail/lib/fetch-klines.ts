import type { DetailChartTimeframe, DetailKlinesResponse } from "@/features/markets/crypto/symbol-detail/lib/types";
import { DETAIL_KLINE_CONFIG } from "@/features/markets/crypto/symbol-detail/lib/types";

export async function fetchDetailKlines(
  symbol: string,
  timeframe: DetailChartTimeframe,
): Promise<DetailKlinesResponse> {
  const sym = symbol.trim().toUpperCase();
  const { interval, limit } = DETAIL_KLINE_CONFIG[timeframe];

  const params = new URLSearchParams({
    symbol: sym,
    interval,
    limit: String(limit),
  });

  const res = await fetch(`/api/markets/crypto/klines?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Kline verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<DetailKlinesResponse>;
}
