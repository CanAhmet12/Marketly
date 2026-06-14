import type { NasdaqFundamentalsResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";

export async function fetchNasdaqDetailFundamentals(
  symbol: string,
  name?: string,
): Promise<NasdaqFundamentalsResponse> {
  const sym = symbol.trim().toUpperCase();
  const params = new URLSearchParams({ symbol: sym });
  if (name?.trim()) params.set("name", name.trim());

  const res = await fetch(`/api/markets/nasdaq/fundamentals?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Temel analiz verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<NasdaqFundamentalsResponse>;
}
