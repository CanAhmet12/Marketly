import type { NasdaqChartTimeframe } from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import type { NasdaqKlinesResponse } from "@/features/markets/nasdaq/lib/nasdaq-chart-types";

export async function fetchNasdaqDetailKlines(
  symbol: string,
  timeframe: NasdaqChartTimeframe,
): Promise<NasdaqKlinesResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym, timeframe });

  const res = await fetch(`/api/markets/nasdaq/klines?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Kline verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<NasdaqKlinesResponse>;
}
