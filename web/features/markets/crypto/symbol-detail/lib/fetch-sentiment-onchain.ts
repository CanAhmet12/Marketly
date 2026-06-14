import type { CryptoSentimentOnchainResponse } from "@/features/markets/crypto/lib/crypto-sentiment-onchain-types";

export async function fetchDetailSentimentOnchain(symbol: string): Promise<CryptoSentimentOnchainResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/crypto/sentiment-onchain?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Duygu & on-chain verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CryptoSentimentOnchainResponse>;
}
