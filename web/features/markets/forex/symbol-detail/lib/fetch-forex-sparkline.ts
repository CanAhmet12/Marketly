import type {
  ForexSparklineRange,
  ForexSparklineResponse,
} from "@/features/markets/forex/lib/forex-chart-types";

export async function fetchForexDetailSparkline(
  symbol: string,
  range: ForexSparklineRange,
): Promise<ForexSparklineResponse> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const params = new URLSearchParams({ symbol: sym, range });

  const res = await fetch(`/api/markets/forex/sparkline?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Sparkline verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<ForexSparklineResponse>;
}
