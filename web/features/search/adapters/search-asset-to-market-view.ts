import { buildSparklineSeries } from "@/features/markets/lib/sparkline-series";
import type { MarketAssetView } from "@/features/markets/types";
import type { SearchAssetHit } from "@/features/search/types";
import { inferMarketAssetCategory } from "@/lib/market-category";

/** SearchAssetHit → MarketAssetView (MarketAssetCard) */
export function searchAssetToMarketView(hit: SearchAssetHit): MarketAssetView {
  const change = hit.change_pct ?? 0;
  const trend: "up" | "down" | "flat" = change > 0.05 ? "up" : change < -0.05 ? "down" : "flat";

  return {
    id: hit.id,
    symbol: hit.symbol,
    name: hit.name?.trim() || hit.symbol,
    price: 0,
    change_percent: change,
    volume: "—",
    trend,
    category: inferMarketAssetCategory(hit.symbol),
    marketCapLabel: "—",
    sparkline: buildSparklineSeries(`search-${hit.id}`, trend),
    signal_active_count: 0,
    signal_bull_pct: 50,
    signal_top_analyst: null,
  };
}
