import type { AssetMarketNewsItem } from "@/features/markets/types/asset-intelligence";

export type CryptoNewsMacroItem = {
  id: string;
  href: string;
  headline: string;
  source: string;
  minutesAgo: number;
  impact: 1 | 2 | 3;
  category: AssetMarketNewsItem["category"];
  categoryLabel: string;
  sentiment: AssetMarketNewsItem["sentiment"];
  sentimentLabel: string;
};

export type CryptoMacroEventItem = {
  id: string;
  href: string;
  title: string;
  dateLabel: string;
  country: string;
  impact: 1 | 2 | 3;
  impactLabel: string;
  type: "unlock" | "etf" | "macro" | "fork" | "listing";
  volatilityHint?: string;
  affectsSymbol: boolean;
};

export type CryptoNewsMacroPayload = {
  symbol: string;
  macroContext: string;
  macroThemes: string[];
  featured: CryptoNewsMacroItem | null;
  news: CryptoNewsMacroItem[];
  events: CryptoMacroEventItem[];
};
