import type { CryptoLiquidityResponse } from "@/features/markets/crypto/lib/crypto-liquidity-types";

export async function fetchDetailLiquidity(symbol: string): Promise<CryptoLiquidityResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({
    symbol: sym,
    depthLimit: "50",
    tradeLimit: "40",
  });

  const res = await fetch(`/api/markets/crypto/liquidity?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Likidite verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<CryptoLiquidityResponse>;
}
