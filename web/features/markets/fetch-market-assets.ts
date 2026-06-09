import type { SupabaseClient } from "@supabase/supabase-js";
import type { MarketAssetCategory, MarketAssetView } from "@/features/markets/types";
import { enrichAllAssetsWithSignals } from "@/features/markets/lib/live-richness/build-asset-intelligence-from-live";
import { resolveSparkline } from "@/features/markets/lib/resolve-sparkline";
import { fetchSignalsFeed } from "@/features/signals/fetch-signals-feed";
import { setAssetCategoryCache } from "@/lib/asset-category-cache";

/** asset_prices + assets JOIN → MarketAssetView[] (sinyal zenginleştirmeli) */
export async function fetchMarketAssets(client: SupabaseClient): Promise<MarketAssetView[]> {
  const [priceResult, signals] = await Promise.all([
    client
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
      .limit(200),
    fetchSignalsFeed(client, 40),
  ]);

  const { data, error } = priceResult;
  if (error || !data) return [];

  const assets = data
    .filter((row: { assets?: unknown }) => row.assets)
    .map((row: Record<string, unknown>): MarketAssetView => {
      const a = row.assets as { id?: string; symbol?: string; name?: string; category?: string };
      const cp = typeof row.change_percent === "number" ? row.change_percent : 0;
      const price = typeof row.price === "number" ? row.price : 0;
      const rawSpark = Array.isArray(row.spark) ? (row.spark as number[]) : [];
      const spark = resolveSparkline({
        symbol: a.symbol ?? String(row.asset_id),
        spark: rawSpark,
        price,
        changePct: cp,
      });
      const cat = (a.category as MarketAssetCategory) ?? "crypto";
      return {
        id:                  a.id ?? String(row.asset_id),
        symbol:              a.symbol ?? String(row.asset_id),
        name:                a.name ?? String(row.asset_id),
        price,
        change_percent:      cp,
        volume:              (row.volume as string | undefined) ?? "-",
        trend:               cp > 0 ? "up" : cp < 0 ? "down" : "flat",
        category:            cat,
        marketCapLabel:      (row.market_cap as string | undefined) ?? "-",
        sparkline:           spark.series,
        signal_active_count: 0,
        signal_bull_pct:     0,
        signal_top_analyst:  null,
      };
    });

  setAssetCategoryCache(assets.map((a) => ({ symbol: a.symbol, category: a.category })));
  return enrichAllAssetsWithSignals(assets, signals);
}
