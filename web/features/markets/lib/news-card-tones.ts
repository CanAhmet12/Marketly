import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";

/** Haber kategorisi → premium kart ton sınıfı */
export type NewsCardTone = "crypto" | "macro" | "earnings" | "flows" | "local";

export const NEWS_CATEGORY_ORDER: readonly NewsCardTone[] = [
  "crypto",
  "macro",
  "earnings",
  "flows",
  "local",
] as const;

export function getNewsCardTone(
  category: MarketNewsIntelligenceItem["newsCategory"],
): NewsCardTone {
  if (
    category === "crypto" ||
    category === "macro" ||
    category === "earnings" ||
    category === "flows" ||
    category === "local"
  ) {
    return category;
  }
  return "macro";
}
