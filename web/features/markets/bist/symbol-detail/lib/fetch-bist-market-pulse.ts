import type { BistMarketPulseResponse } from "@/features/markets/bist/lib/bist-detail-types";

export async function fetchBistDetailMarketPulse(
  symbol: string,
  changePct?: number,
): Promise<BistMarketPulseResponse> {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const params = new URLSearchParams({ symbol: sym });
  if (changePct != null && Number.isFinite(changePct)) {
    params.set("changePct", String(changePct));
  }

  const res = await fetch(`/api/markets/bist/market-pulse?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`BIST pulse verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<BistMarketPulseResponse>;
}
