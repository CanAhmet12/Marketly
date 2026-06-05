/** Piyasa haberleri — haber odası (MarketsRepository) */

export type MarketNewsIntelligenceItem = {
  id: string;
  symbol: string;
  headline: string;
  source: string;
  minutesAgo: number;
  impactTier: 1 | 2 | 3;
  affectedSymbols: readonly string[];
  sectorImpact: string;
  volatilityExpectation: string;
  signalActivityLabel: string;
  creatorCommentary: readonly { display: string; href: string; note: string }[];
  discussionSnippet: string;
  marketReaction: string;
  momentumShift: string;
  relatedMacroThemes: readonly string[];
  chainReactionHint: string;
  /** Benzer haber / geçmiş seans tepkisi */
  historicalEcho: string;
  hitsWatchlist: boolean;
  hitsPortfolio: boolean;
  /** Haber sınıfı — filtre */
  newsCategory: "macro" | "earnings" | "flows" | "crypto" | "local";
};

export type MarketNewsroomBundle = {
  items: readonly MarketNewsIntelligenceItem[];
  personalizedHeadline: string;
  categoryCounts: Record<"all" | "macro" | "earnings" | "flows" | "crypto" | "local", number>;
};

/** Ekonomik takvim — makro istihbarat (MarketsRepository) */

export type EconomicCalendarIntelEvent = {
  id: string;
  at: string;
  country: string;
  title: string;
  impact: 1 | 2 | 3;
  affectedSymbols: readonly string[];
  volatilityExpectation: string;
  consensusExpectation: string;
  historicalMemory: string;
  positioningLabel: string;
  creatorCommentary: readonly { display: string; href: string; note: string }[];
  relatedSignalsLabel: string;
  relatedSignalsHref: string;
  sentimentBefore: string;
  sentimentAfter: string;
  macroTheme: string;
  discussionRows: readonly { id: string; label: string; stance: string; href: string }[];
  networkHint: string;
  hitsWatchlist: boolean;
  hitsPortfolio: boolean;
};

export type EconomicCalendarIntelligenceBundle = {
  events: readonly EconomicCalendarIntelEvent[];
  personalizedHeadline: string;
  narrativeShift: string;
};

export function emptyMarketNewsroomBundle(): MarketNewsroomBundle {
  return {
    items: [],
    personalizedHeadline: "Haber akışı bekleniyor",
    categoryCounts: { all: 0, macro: 0, earnings: 0, flows: 0, crypto: 0, local: 0 },
  };
}

export function emptyEconomicCalendarIntelligenceBundle(): EconomicCalendarIntelligenceBundle {
  return {
    events: [],
    personalizedHeadline: "Takvim verisi bekleniyor",
    narrativeShift: "—",
  };
}
