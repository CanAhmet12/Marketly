import type { ForexCrossPairResponse } from "@/features/markets/forex/lib/forex-detail-types";

export async function fetchForexDetailCrossPair(symbol: string): Promise<ForexCrossPairResponse> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/forex/cross-pair?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Cross-pair verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<ForexCrossPairResponse>;
}
