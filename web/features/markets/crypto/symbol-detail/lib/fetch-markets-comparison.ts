import type { CryptoMarketsComparisonResponse } from "@/features/markets/crypto/lib/crypto-markets-comparison-types";

export async function fetchDetailMarketsComparison(
  symbol: string,
): Promise<CryptoMarketsComparisonResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/crypto/markets-comparison?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Borsa karşılaştırması alınamadı (${res.status})`);
  }

  return res.json() as Promise<CryptoMarketsComparisonResponse>;
}
