import type { SupabaseClient } from "@supabase/supabase-js";
import type { MarketAssetCategory, MarketAssetView } from "@/features/markets/types";

/** asset_prices + assets JOIN → MarketAssetView[] */
export async function fetchMarketAssets(client: SupabaseClient): Promise<MarketAssetView[]> {
  const { data, error } = await client
    .from("asset_prices")
    .select(`
      asset_id,
      price,
      change_percent,
      volume,
      market_cap,
      spark,
      updated_at,
      assets!asset_prices_asset_id_fkey (
        id,
        symbol,
        name,
        category
      )
    `)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];

  return data
    .filter((row: any) => row.assets)
    .map((row: any): MarketAssetView => {
      const a = row.assets;
      const cp = typeof row.change_percent === "number" ? row.change_percent : 0;
      return {
        id:                  a.id ?? row.asset_id,
        symbol:              a.symbol ?? row.asset_id,
        name:                a.name ?? row.asset_id,
        price:               typeof row.price === "number" ? row.price : 0,
        change_percent:      cp,
        volume:              row.volume ?? "-",
        trend:               cp > 0 ? "up" : cp < 0 ? "down" : "flat",
        category:            (a.category as MarketAssetCategory) ?? "crypto",
        marketCapLabel:      row.market_cap ?? "-",
        sparkline:           Array.isArray(row.spark) ? row.spark : [],
        signal_active_count: 0,
        signal_bull_pct:     0,
        signal_top_analyst:  null,
      };
    });
}
