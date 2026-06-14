import type { ForexMacroRatesResponse } from "@/features/markets/forex/lib/forex-detail-types";

export async function fetchForexDetailMacroRates(symbol: string): Promise<ForexMacroRatesResponse> {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const params = new URLSearchParams({ symbol: sym });

  const res = await fetch(`/api/markets/forex/macro-rates?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Makro faiz verisi alınamadı (${res.status})`);
  }

  return res.json() as Promise<ForexMacroRatesResponse>;
}
