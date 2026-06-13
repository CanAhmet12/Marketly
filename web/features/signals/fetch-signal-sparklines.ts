import type { SupabaseClient } from "@supabase/supabase-js";

import { parseRpcRows } from "@/lib/supabase/parse-rpc-rows";

type SparkRpcRow = {
  price_point: number | string;
  price_date?: string;
  source?: string;
};

const MAX_SYMBOLS = 24;

function toPricePoints(rows: SparkRpcRow[]): number[] {
  return rows
    .map((r) => Number(r.price_point))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Tek sembol için `get_asset_sparkline` — cache veya history fallback */
export async function fetchSparklineForSymbol(
  client: SupabaseClient,
  symbol: string,
  days = 7,
): Promise<number[]> {
  const sym = symbol.trim();
  if (!sym) return [];

  const { data, error } = await client.rpc("get_asset_sparkline", {
    p_symbol: sym,
    p_days: days,
  });
  if (error) {
    console.warn("[signals] get_asset_sparkline", sym, error.message);
    return [];
  }

  const pts = toPricePoints(parseRpcRows<SparkRpcRow>(data));
  return pts.length >= 2 ? pts : [];
}

/** Feed satırlarındaki benzersiz semboller için paralel sparkline toplama */
export async function fetchSparklinesForSymbols(
  client: SupabaseClient,
  symbols: readonly string[],
  days = 7,
): Promise<Map<string, number[]>> {
  const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_SYMBOLS);
  const map = new Map<string, number[]>();
  if (!unique.length) return map;

  await Promise.all(
    unique.map(async (sym) => {
      const pts = await fetchSparklineForSymbol(client, sym, days);
      if (pts.length >= 2) map.set(sym, pts);
    }),
  );

  return map;
}
