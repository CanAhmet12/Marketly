import type { MarketAssetCategory } from "@/features/markets/types";

export type SignalMarketSectionDef = {
  id: MarketAssetCategory;
  label: string;
  kicker: string;
  tone: "crypto" | "bist" | "forex" | "commodity" | "macro";
};

export const SIGNAL_MARKET_SECTIONS: SignalMarketSectionDef[] = [
  { id: "crypto", label: "Kripto Sinyalleri", kicker: "BTC · ETH · SOL", tone: "crypto" },
  { id: "stocks", label: "Hisse Sinyalleri", kicker: "BIST · NASDAQ", tone: "bist" },
  { id: "forex", label: "Forex Sinyalleri", kicker: "Majör pariteler", tone: "forex" },
  { id: "commodity", label: "Emtia Sinyalleri", kicker: "Altın · Petrol", tone: "commodity" },
  { id: "index", label: "Endeks Sinyalleri", kicker: "Makro endeks", tone: "macro" },
];

export const SIGNAL_MARKET_CATEGORY_IDS = SIGNAL_MARKET_SECTIONS.map((s) => s.id);
