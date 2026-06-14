import type { MarketAssetCategory } from "@/features/markets/types";

import { marketsCategoryPath } from "@/features/markets/markets-routes";

export type DetailCategorySlug = "crypto" | "commodities" | "forex" | "bist" | "nasdaq";

const CATEGORY_ACCENT: Record<string, string> = {
  crypto: "#f7931a",
  commodity: "#f97316",
  bist: "#3b82f6",
  stocks: "#06b6d4",
  forex: "#8b5cf6",
  index: "#3b82f6",
};

const CATEGORY_HUB_SLUG: Record<string, DetailCategorySlug> = {
  crypto: "crypto",
  commodity: "commodities",
  bist: "bist",
  stocks: "nasdaq",
  forex: "forex",
  index: "nasdaq",
};

const CATEGORY_LABEL: Record<string, string> = {
  crypto: "Kripto",
  commodity: "Emtia",
  bist: "BIST",
  stocks: "Hisse",
  forex: "Döviz",
  index: "Endeks",
};

export function detailCategoryAccent(category: string, fallback = "#f7931a"): string {
  return CATEGORY_ACCENT[category] ?? fallback;
}

export function detailCategoryHubPath(category: string): string {
  const slug = CATEGORY_HUB_SLUG[category] ?? "crypto";
  return marketsCategoryPath(slug);
}

export function detailCategoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? "Piyasalar";
}

export function detailCategoryFromMarket(category: MarketAssetCategory | string): string {
  if (category === "commodity") return "commodity";
  if (category === "crypto") return "crypto";
  if (category === "forex") return "forex";
  if (category === "stocks") return "stocks";
  if (category === "index") return "index";
  return "crypto";
}
