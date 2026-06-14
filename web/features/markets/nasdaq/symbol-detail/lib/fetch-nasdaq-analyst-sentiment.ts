import type { NasdaqAnalystSentimentResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";

export async function fetchNasdaqDetailAnalystSentiment(
  symbol: string,
): Promise<NasdaqAnalystSentimentResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/nasdaq/analyst-sentiment?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Analist sentiment verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<NasdaqAnalystSentimentResponse>;
}
