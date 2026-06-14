import type { BistPeerComparisonResponse } from "@/features/markets/bist/lib/bist-detail-types";

export async function fetchBistDetailPeerComparison(
  symbol: string,
): Promise<BistPeerComparisonResponse> {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/bist/peer-comparison?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Peer karşılaştırması alınamadı (${res.status})`);
  }

  return res.json() as Promise<BistPeerComparisonResponse>;
}
