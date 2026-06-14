import type { NasdaqSpreadSessionResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";

export async function fetchNasdaqDetailSpreadSession(
  symbol: string,
): Promise<NasdaqSpreadSessionResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/nasdaq/spread-session?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Spread/seans verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<NasdaqSpreadSessionResponse>;
}
