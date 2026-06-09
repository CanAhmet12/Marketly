import type { SupabaseClient } from "@supabase/supabase-js";

import type { PortfolioCorrelatedPair } from "@/features/markets/lib/build-portfolio-correlated-pairs";
import { parseRpcRows } from "@/lib/supabase/parse-rpc-rows";

export type CorrelatedAssetRpcRow = {
  symbol: string;
  correlation: number;
  sample_days: number;
  direction: string;
};

/** `get_correlated_assets` — Pearson korelasyon (90g pencere) */
export async function fetchCorrelatedAssets(
  client: SupabaseClient,
  symbol: string,
  limit = 5,
): Promise<CorrelatedAssetRpcRow[]> {
  try {
    const { data, error } = await client.rpc("get_correlated_assets", {
      p_symbol: symbol.trim().toUpperCase(),
      p_limit: limit,
      p_window_days: 90,
    });
    if (error) {
      console.warn("[markets] get_correlated_assets", error.message);
      return [];
    }
    return parseRpcRows<CorrelatedAssetRpcRow>(data);
  } catch (e) {
    console.warn("[markets] fetchCorrelatedAssets", e);
    return [];
  }
}

/** Portföy sembolleriyle kesişen Pearson çiftleri */
export function mapCorrelationsToPortfolioPairs(
  anchorSymbol: string,
  correlations: readonly CorrelatedAssetRpcRow[],
  portfolioSymbols: readonly string[],
): PortfolioCorrelatedPair[] {
  const port = new Set(portfolioSymbols.map((s) => s.toUpperCase()));
  const anchor = anchorSymbol.toUpperCase();
  const out: PortfolioCorrelatedPair[] = [];

  for (const row of correlations) {
    const sym = row.symbol.toUpperCase();
    if (!port.has(sym) || sym === anchor) continue;
    const pct = Math.round(Math.abs(row.correlation) * 100);
    const dir =
      row.direction === "positive"
        ? "Pozitif korelasyon"
        : row.direction === "negative"
          ? "Negatif korelasyon"
          : "Karışık korelasyon";
    out.push({
      a: anchor,
      b: sym,
      note: `${dir} · r=${row.correlation.toFixed(2)} (${row.sample_days}g)`,
    });
  }
  return out;
}
