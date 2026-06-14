import type { BistFundamentalsResponse } from "@/features/markets/bist/lib/bist-detail-types";

export async function fetchBistDetailFundamentals(
  symbol: string,
  name?: string,
): Promise<BistFundamentalsResponse> {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const params = new URLSearchParams({ symbol: sym });
  if (name?.trim()) params.set("name", name.trim());

  const res = await fetch(`/api/markets/bist/fundamentals?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Temel analiz verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<BistFundamentalsResponse>;
}
