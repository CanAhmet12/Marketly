import { getMarketNewsPhoto } from "@/features/markets/lib/market-news-shared";
import type { NewsCardTone } from "@/features/markets/lib/news-card-tones";
import type { AssetMarketNewsItem } from "@/features/markets/types/asset-intelligence";
import type { CardTagTone } from "@/features/discover/visual-reference/discover-card-tones";

export function assetNewsToCardTone(category: AssetMarketNewsItem["category"]): NewsCardTone {
  if (category === "flows") return "flows";
  if (category === "earnings") return "earnings";
  if (category === "macro" || category === "policy") return "macro";
  return "crypto";
}

export function assetNewsToVideoTone(category: AssetMarketNewsItem["category"]): CardTagTone {
  const tone = assetNewsToCardTone(category);
  if (tone === "crypto") return "crypto";
  if (tone === "flows") return "macro";
  if (tone === "earnings") return "bist";
  return "macro";
}

export function assetNewsPhotoUrl(item: AssetMarketNewsItem): string {
  return getMarketNewsPhoto({
    id: item.id,
    newsCategory: assetNewsToCardTone(item.category),
    imageUrl: null,
  });
}

export function assetNewsCategoryLabel(category: AssetMarketNewsItem["category"]): string {
  if (category === "macro" || category === "policy") return "Makro";
  if (category === "flows") return "ETF";
  if (category === "earnings") return "Kazanç";
  if (category === "technical") return "Teknik";
  return "Kripto";
}

export function assetNewsSentimentLabel(
  sentiment: AssetMarketNewsItem["sentiment"],
): { label: string; tone: CardTagTone } {
  if (sentiment === "positive") return { label: "Pozitif", tone: "crypto" };
  if (sentiment === "negative") return { label: "Negatif", tone: "deriv" };
  if (sentiment === "mixed") return { label: "Karışık", tone: "forex" };
  return { label: "Nötr", tone: "default" };
}

export function assetNewsImpactLabel(impact: AssetMarketNewsItem["impact"]): string {
  if (impact === 3) return "Yüksek etki";
  if (impact === 2) return "Orta etki";
  return "Düşük etki";
}
