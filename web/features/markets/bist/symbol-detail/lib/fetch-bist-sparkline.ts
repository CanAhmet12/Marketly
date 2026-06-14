import type {
  BistSparklineRange,
  BistSparklineResponse,
} from "@/features/markets/bist/lib/bist-chart-types";

export async function fetchBistDetailSparkline(
  symbol: string,
  range: BistSparklineRange,
): Promise<BistSparklineResponse> {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const params = new URLSearchParams({ symbol: sym, range });

  const res = await fetch(`/api/markets/bist/sparkline?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Sparkline verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<BistSparklineResponse>;
}
