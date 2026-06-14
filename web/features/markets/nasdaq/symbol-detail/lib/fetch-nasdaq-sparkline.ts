import type {
  NasdaqSparklineRange,
  NasdaqSparklineResponse,
} from "@/features/markets/nasdaq/lib/nasdaq-chart-types";

export async function fetchNasdaqDetailSparkline(
  symbol: string,
  range: NasdaqSparklineRange,
): Promise<NasdaqSparklineResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym, range });

  const res = await fetch(`/api/markets/nasdaq/sparkline?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Sparkline verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<NasdaqSparklineResponse>;
}
