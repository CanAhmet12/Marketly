import type { CryptoDerivativesResponse } from "@/features/markets/crypto/lib/crypto-derivatives-types";

export async function fetchDetailDerivatives(symbol: string): Promise<CryptoDerivativesResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/crypto/derivatives?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Türev verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CryptoDerivativesResponse>;
}
