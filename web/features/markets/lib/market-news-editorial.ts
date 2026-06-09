import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { scoreFinanceHeadline } from "@/features/markets/lib/finance-sentiment";
import { AlgoFlags } from "@/lib/algo-flags";

/** Editöryal skor: güncellik + etki + kişiselleştirme + sentiment */
export function newsEditorialScore(item: MarketNewsIntelligenceItem): number {
  const recency = Math.max(0, 1 - item.minutesAgo / 1440);
  const impact = item.impactTier / 3;
  const personal =
    (item.hitsWatchlist ? 0.18 : 0) + (item.hitsPortfolio ? 0.12 : 0);
  const sentiment = AlgoFlags.marketDataAlgorithms
    ? (scoreFinanceHeadline(item.headline) + 1) / 2
    : 0.5;
  return impact * 0.36 + recency * 0.34 + personal + sentiment * 0.15;
}

export function sortByEditorialPriority(
  items: readonly MarketNewsIntelligenceItem[],
): MarketNewsIntelligenceItem[] {
  return [...items].sort((a, b) => newsEditorialScore(b) - newsEditorialScore(a));
}

export function pickHeroStack(
  items: readonly MarketNewsIntelligenceItem[],
  sideCount = 2,
): { main: MarketNewsIntelligenceItem; side: MarketNewsIntelligenceItem[] } {
  const sorted = sortByEditorialPriority(items);
  const main = sorted[0]!;
  const side = sorted.slice(1, 1 + sideCount);
  return { main, side };
}

function symbolOverlapScore(
  anchor: MarketNewsIntelligenceItem,
  candidate: MarketNewsIntelligenceItem,
): number {
  const anchorSet = new Set(anchor.affectedSymbols.map((s) => s.toUpperCase()));
  let overlap = 0;
  for (const sym of candidate.affectedSymbols) {
    if (anchorSet.has(sym.toUpperCase())) overlap += 1;
  }
  return overlap;
}

/** İlgili haberler — sembol kesişimi + kategori + editöryal skor */
export function pickRelatedNews(
  anchor: MarketNewsIntelligenceItem,
  pool: readonly MarketNewsIntelligenceItem[],
  limit = 4,
): MarketNewsIntelligenceItem[] {
  return pool
    .filter((i) => i.id !== anchor.id)
    .map((i) => {
      const overlap = symbolOverlapScore(anchor, i);
      const sameCat = i.newsCategory === anchor.newsCategory ? 0.22 : 0;
      const score = overlap * 0.38 + newsEditorialScore(i) * 0.28 + sameCat;
      return { item: i, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((e) => e.item);
}
