import type { MarketNewsDetailItem, MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";

import { newsEditorialScore } from "./market-news-editorial";

/** Haber kanalı baskı tarihi — masthead */
export function formatNewsEditionDate(now = new Date()): string {
  return now.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Okuma süresi tahmini */
export function estimateReadMinutes(text: string | null | undefined): number {
  if (!text?.trim()) return 2;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.min(12, Math.ceil(words / 180)));
}

export function pickStandfirst(
  item: MarketNewsDetailItem,
  body: string | null,
): string | null {
  const summary = item.summary?.trim();
  if (summary && summary !== "—") return summary;
  if (body) {
    const first = body.split(/(?<=[.!?])\s+/)[0]?.trim();
    if (first && first.length > 40) return first;
    if (body.length <= 220) return body;
    return `${body.slice(0, 200).trim()}…`;
  }
  const snippet = item.discussionSnippet?.trim();
  if (snippet && snippet !== "—") return snippet;
  return null;
}

export function pickBreakingLead(
  items: readonly MarketNewsIntelligenceItem[],
): MarketNewsIntelligenceItem | null {
  const tier3 = items.filter((i) => i.impactTier >= 3);
  if (tier3.length === 0) return null;
  return [...tier3].sort((a, b) => newsEditorialScore(b) - newsEditorialScore(a))[0] ?? null;
}

/** Ticker + wire — kısa başlık listesi */
export function pickWireHeadlines(
  items: readonly MarketNewsIntelligenceItem[],
  limit = 10,
  excludeIds?: ReadonlySet<string>,
): MarketNewsIntelligenceItem[] {
  return items
    .filter((i) => !(excludeIds?.has(i.id) ?? false))
    .sort((a, b) => {
      if (a.impactTier !== b.impactTier) return b.impactTier - a.impactTier;
      return a.minutesAgo - b.minutesAgo;
    })
    .slice(0, limit);
}
