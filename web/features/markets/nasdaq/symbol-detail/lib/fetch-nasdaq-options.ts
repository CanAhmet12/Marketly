import type { NasdaqOptionsResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";

export async function fetchNasdaqDetailOptions(symbol: string): Promise<NasdaqOptionsResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/nasdaq/options?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Opsiyon verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<NasdaqOptionsResponse>;
}
