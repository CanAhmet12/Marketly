import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";

/** Mock/live boş intel alanları */
export function isIntelPlaceholder(value: string | undefined | null): boolean {
  if (!value) return true;
  const t = value.trim();
  return t.length === 0 || t === "—" || t === "-";
}

export function newsIntelBulletsFiltered(
  item: MarketNewsIntelligenceItem,
  bodyText?: string | null,
): string[] {
  const bullets: string[] = [];

  for (const value of [
    item.marketReaction,
    item.volatilityExpectation,
    item.momentumShift,
  ]) {
    if (!isIntelPlaceholder(value) && !bullets.includes(value)) {
      bullets.push(value);
    }
  }

  const snippet = item.discussionSnippet?.trim();
  if (
    snippet &&
    !isIntelPlaceholder(snippet) &&
    bodyText !== snippet &&
    !bullets.includes(snippet)
  ) {
    bullets.unshift(snippet);
  }

  return bullets.slice(0, 3);
}

export function hasMarketReactionIntel(item: MarketNewsIntelligenceItem): boolean {
  return (
    !isIntelPlaceholder(item.marketReaction) || !isIntelPlaceholder(item.momentumShift)
  );
}

export function hasVolatilityIntel(item: MarketNewsIntelligenceItem): boolean {
  return (
    !isIntelPlaceholder(item.volatilityExpectation) ||
    !isIntelPlaceholder(item.signalActivityLabel)
  );
}

export function hasChainIntel(item: MarketNewsIntelligenceItem): boolean {
  return (
    !isIntelPlaceholder(item.chainReactionHint) || item.relatedMacroThemes.length > 0
  );
}

export function hasHistoricalIntel(item: MarketNewsIntelligenceItem): boolean {
  return !isIntelPlaceholder(item.historicalEcho);
}

export function hasDiscussionIntel(item: MarketNewsIntelligenceItem): boolean {
  return !isIntelPlaceholder(item.discussionSnippet);
}

export function hasRichIntelSections(item: MarketNewsIntelligenceItem): boolean {
  return (
    hasMarketReactionIntel(item) ||
    hasVolatilityIntel(item) ||
    hasChainIntel(item) ||
    hasHistoricalIntel(item) ||
    item.creatorCommentary.length > 0
  );
}

export function articleBodyText(
  item: MarketNewsIntelligenceItem & { summary?: string | null },
): string | null {
  const summary = item.summary?.trim();
  if (summary && !isIntelPlaceholder(summary)) return summary;
  if (hasDiscussionIntel(item)) return item.discussionSnippet.trim();
  return null;
}
