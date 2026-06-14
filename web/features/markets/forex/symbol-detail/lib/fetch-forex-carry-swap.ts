import type { ForexCarrySwapResponse } from "@/features/markets/forex/lib/forex-detail-types";

export async function fetchForexDetailCarrySwap(symbol: string): Promise<ForexCarrySwapResponse> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/forex/carry-swap?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Carry/swap verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<ForexCarrySwapResponse>;
}
