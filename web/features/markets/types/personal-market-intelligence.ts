/** Kişisel takip listesi istihbaratı — MarketsRepository sözleşmesi */

export type WatchlistMoverIntel = {
  symbol: string;
  name: string;
  change_percent: number;
  href: string;
  signalCount: number;
};

export type WatchlistSignalPulse = {
  activeOnWatch: number;
  new24hLabel: string;
  premiumOnWatch: number;
  copies24h: number;
  summaryLabel: string;
};

export type WatchlistCreatorPulseRow = {
  display: string;
  href: string;
  symbol: string;
  note: string;
};

export type WatchlistSentimentShift = {
  symbol: string;
  label: string;
  href: string;
};

export type WatchlistDiscussionRow = {
  id: string;
  symbol: string;
  headline: string;
  meta: string;
  href: string;
  live?: boolean;
};

export type WatchlistVolatilityRow = {
  symbol: string;
  label: string;
  href: string;
};

export type WatchlistPersonalContext = {
  risingAttention: readonly { symbol: string; name: string; deltaLabel: string; href: string }[];
  followedCreatorTouches: readonly { symbol: string; creatorDisplay: string; href: string }[];
  newPremiumSignals: readonly { symbol: string; count: number; href: string }[];
  followedAnalystsOnWatch: readonly { display: string; href: string; symbols: string }[];
  sentimentShifts: readonly WatchlistSentimentShift[];
  macroEventsForWatch: readonly { id: string; title: string; href: string; at: string }[];
  heatLabel: string;
  convictionCluster: string;
};

export type WatchlistNetworkFX = {
  communityOverlap: string;
  trendingCreatorAssets: readonly { symbol: string; href: string; score: number }[];
  narrative: string;
  consensusShiftNote: string;
};

export type WatchlistOnboardingIntel = {
  suggestedSymbols: readonly { symbol: string; name: string; hint: string; href: string }[];
  trendingThemes: readonly string[];
  creatorPicks: readonly { display: string; href: string; reason: string }[];
  starterLabel: string;
};

export type WatchlistIntelligenceBundle = {
  watchedCount: number;
  pinnedCount: number;
  movers: readonly WatchlistMoverIntel[];
  signalPulse: WatchlistSignalPulse;
  creatorPulse: readonly WatchlistCreatorPulseRow[];
  sentimentShifts: readonly WatchlistSentimentShift[];
  discussionFeed: readonly WatchlistDiscussionRow[];
  volatility: readonly WatchlistVolatilityRow[];
  personal: WatchlistPersonalContext;
  network: WatchlistNetworkFX;
  onboarding: WatchlistOnboardingIntel | null;
};

/** Portföy istihbaratı — MarketsRepository */

export type PortfolioHoldingIntel = {
  symbol: string;
  name: string;
  weightPct: number;
  category: string;
  contributionLabel: string;
  href: string;
};

export type PortfolioRiskIntel = {
  concentrationLabel: string;
  topWeightPct: number;
  sectorTop: readonly { label: string; pct: number }[];
  macroSensitivity: string;
  correlatedPairs: readonly { a: string; b: string; note: string }[];
  volCluster: string;
  regimeAlignment: string;
  momentumVsDefense: string;
};

export type PortfolioOverlapIntel = {
  creatorConcentration: string;
  signalThemeTop: string;
  overlappingAnalysts: readonly { display: string; href: string; count: number }[];
};

export type PortfolioIntelligenceBundle = {
  headlineSentiment: string;
  strategyMix: readonly { label: string; pct: number }[];
  holdings: readonly PortfolioHoldingIntel[];
  risk: PortfolioRiskIntel;
  overlaps: PortfolioOverlapIntel;
  portfolioSymbols: readonly string[];
};

export function emptyWatchlistIntelligenceBundle(): WatchlistIntelligenceBundle {
  const emptyPersonal: WatchlistPersonalContext = {
    risingAttention: [],
    followedCreatorTouches: [],
    newPremiumSignals: [],
    followedAnalystsOnWatch: [],
    sentimentShifts: [],
    macroEventsForWatch: [],
    heatLabel: "—",
    convictionCluster: "—",
  };
  return {
    watchedCount: 0,
    pinnedCount: 0,
    movers: [],
    signalPulse: {
      activeOnWatch: 0,
      new24hLabel: "—",
      premiumOnWatch: 0,
      copies24h: 0,
      summaryLabel: "Veri bekleniyor",
    },
    creatorPulse: [],
    sentimentShifts: [],
    discussionFeed: [],
    volatility: [],
    personal: emptyPersonal,
    network: {
      communityOverlap: "—",
      trendingCreatorAssets: [],
      narrative: "—",
      consensusShiftNote: "—",
    },
    onboarding: null,
  };
}

export function emptyPortfolioIntelligenceBundle(): PortfolioIntelligenceBundle {
  return {
    headlineSentiment: "—",
    strategyMix: [],
    holdings: [],
    risk: {
      concentrationLabel: "—",
      topWeightPct: 0,
      sectorTop: [],
      macroSensitivity: "—",
      correlatedPairs: [],
      volCluster: "—",
      regimeAlignment: "—",
      momentumVsDefense: "—",
    },
    overlaps: {
      creatorConcentration: "—",
      signalThemeTop: "—",
      overlappingAnalysts: [],
    },
    portfolioSymbols: [],
  };
}
