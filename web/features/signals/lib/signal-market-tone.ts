import type { MarketAssetCategory } from "@/features/markets/types";

export type SignalMarketTone = "crypto" | "bist" | "forex" | "commodity" | "macro";

const TONE_BY_CATEGORY: Record<MarketAssetCategory, SignalMarketTone> = {
  crypto: "crypto",
  stocks: "bist",
  forex: "forex",
  commodity: "commodity",
  index: "macro",
};

export function signalMarketTone(category: MarketAssetCategory): SignalMarketTone {
  return TONE_BY_CATEGORY[category] ?? "macro";
}
