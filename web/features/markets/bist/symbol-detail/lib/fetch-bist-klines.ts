import type {
  BistChartTimeframe,
  BistKlinesResponse,
} from "@/features/markets/bist/lib/bist-chart-types";

export async function fetchBistDetailKlines(
  symbol: string,
  timeframe: BistChartTimeframe,
): Promise<BistKlinesResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym, timeframe });

  const res = await fetch(`/api/markets/bist/klines?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Kline verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<BistKlinesResponse>;
}
