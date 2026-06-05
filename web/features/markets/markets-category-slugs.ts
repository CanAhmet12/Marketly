import type { MarketSegmentId } from "@/features/markets/types";

/** URL segment under `/markets/category/[category]` */
export const MARKETS_CATEGORY_SLUGS = ["crypto", "bist", "forex", "commodities", "nasdaq"] as const;

export type MarketsCategorySlug = (typeof MARKETS_CATEGORY_SLUGS)[number];

export function isValidMarketsCategorySlug(s: string): s is MarketsCategorySlug {
  return (MARKETS_CATEGORY_SLUGS as readonly string[]).includes(s);
}

/**
 * Slug → `MarketSegmentId` (mevcut `applyMarketSegment` ile uyumlu).
 *
 * **BIST:** Veri modelinde ayrı `bist` segmenti yok; şimdilik `stocks` ile aynı küme.
 * TODO: `exchange` / `region` veya `isBist` benzeri alanla yalnızca BIST hisselerini süzmek
 * (mock `MarketAssetView` + Supabase gerçek veri).
 */
export function mapMarketsCategorySlugToSegment(slug: MarketsCategorySlug): MarketSegmentId {
  switch (slug) {
    case "crypto":
      return "crypto";
    case "forex":
      return "forex";
    case "commodities":
      return "commodity";
    case "nasdaq":
      return "stocks";
    case "bist":
      return "stocks";
    default:
      return "all";
  }
}
