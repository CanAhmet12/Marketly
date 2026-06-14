import type { BistSpreadSessionResponse } from "@/features/markets/bist/lib/bist-detail-types";

export async function fetchBistDetailSpreadSession(
  symbol: string,
): Promise<BistSpreadSessionResponse> {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/bist/spread-session?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Seans verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<BistSpreadSessionResponse>;
}
