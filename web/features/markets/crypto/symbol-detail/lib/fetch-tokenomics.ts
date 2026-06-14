import type { CryptoTokenomicsResponse } from "@/features/markets/crypto/lib/crypto-tokenomics-types";

export async function fetchDetailTokenomics(symbol: string): Promise<CryptoTokenomicsResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/crypto/tokenomics?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Tokenomics verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CryptoTokenomicsResponse>;
}
