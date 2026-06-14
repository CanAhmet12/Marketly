import type { ForexMarketPulseResponse } from "@/features/markets/forex/lib/forex-detail-types";

export async function fetchForexDetailMarketPulse(
  symbol: string,
  changePct?: number,
): Promise<ForexMarketPulseResponse> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const params = new URLSearchParams({ symbol: sym });
  if (changePct != null && Number.isFinite(changePct)) {
    params.set("changePct", String(changePct));
  }

  const res = await fetch(`/api/markets/forex/market-pulse?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`FX pulse verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<ForexMarketPulseResponse>;
}
