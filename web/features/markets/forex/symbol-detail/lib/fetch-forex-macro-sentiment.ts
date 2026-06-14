import type { ForexMacroSentimentResponse } from "@/features/markets/forex/lib/forex-detail-types";

export async function fetchForexDetailMacroSentiment(symbol: string): Promise<ForexMacroSentimentResponse> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/forex/macro-sentiment?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Makro sentiment verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<ForexMacroSentimentResponse>;
}
