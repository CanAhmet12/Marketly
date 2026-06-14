import type { BistMacroFxResponse } from "@/features/markets/bist/lib/bist-detail-types";

export async function fetchBistDetailMacroFx(symbol: string): Promise<BistMacroFxResponse> {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/bist/macro-fx?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Makro verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<BistMacroFxResponse>;
}
