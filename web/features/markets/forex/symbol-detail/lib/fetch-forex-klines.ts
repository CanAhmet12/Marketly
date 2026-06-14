import type { ForexChartTimeframe } from "@/features/markets/forex/lib/forex-chart-types";
import type { ForexKlinesResponse } from "@/features/markets/forex/lib/forex-chart-types";

export async function fetchForexDetailKlines(
  symbol: string,
  timeframe: ForexChartTimeframe,
): Promise<ForexKlinesResponse> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const params = new URLSearchParams({ symbol: sym, timeframe });

  const res = await fetch(`/api/markets/forex/klines?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Kline verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<ForexKlinesResponse>;
}
