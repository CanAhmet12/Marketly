import type { NasdaqMarketPulseResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";

export async function fetchNasdaqDetailMarketPulse(
  symbol: string,
  changePct?: number,
): Promise<NasdaqMarketPulseResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });
  if (changePct != null && Number.isFinite(changePct)) {
    params.set("changePct", String(changePct));
  }

  const res = await fetch(`/api/markets/nasdaq/market-pulse?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Hisse pulse verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<NasdaqMarketPulseResponse>;
}
