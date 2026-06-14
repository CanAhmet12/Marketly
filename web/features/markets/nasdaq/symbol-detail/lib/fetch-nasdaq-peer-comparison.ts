import type { NasdaqPeerComparisonResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";

export async function fetchNasdaqDetailPeerComparison(
  symbol: string,
): Promise<NasdaqPeerComparisonResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/nasdaq/peer-comparison?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Peer karşılaştırması alınamadı (${res.status})`);
  }

  return res.json() as Promise<NasdaqPeerComparisonResponse>;
}
