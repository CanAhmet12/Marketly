import type { ForexSpreadSessionResponse } from "@/features/markets/forex/lib/forex-detail-types";

export async function fetchForexDetailSpreadSession(symbol: string): Promise<ForexSpreadSessionResponse> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/forex/spread-session?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Spread/seans verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<ForexSpreadSessionResponse>;
}
