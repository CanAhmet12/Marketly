import type { SignalsMarketplaceRail } from "@/features/signals/repository/types";

const TREND_IDS = new Set(["trending_signals", "trending"]);
const HIGH_CONF_IDS = new Set(["high_confidence", "high_conviction"]);

/** Trend + yüksek güven rayları — filtrelenmiş feed'den */
export function pickFeaturedRails(rails: SignalsMarketplaceRail[]): SignalsMarketplaceRail[] {
  const out: SignalsMarketplaceRail[] = [];
  const trend = rails.find((r) => TREND_IDS.has(r.id));
  const high = rails.find((r) => HIGH_CONF_IDS.has(r.id));
  if (trend) out.push(trend);
  if (high) out.push(high);
  if (!out.length && rails.length) return rails.slice(0, 2);
  return out;
}
