import type { CryptoMarketPulseResponse } from "@/features/markets/crypto/lib/crypto-market-pulse-types";

export async function fetchDetailMarketPulse(symbol: string): Promise<CryptoMarketPulseResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/crypto/market-pulse?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Piyasa pulse verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CryptoMarketPulseResponse>;
}
