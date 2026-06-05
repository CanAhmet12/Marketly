import type { MarketAssetView, MarketDetailExtras } from "@/features/markets/types";
import type { MarketsHomePayload } from "@/features/markets/repository/markets-repository";
import type { WatchlistMarketsContext } from "@/features/markets/types/markets-intelligence";

import {
  buildMarketAssetViews,
  computeMarketHero,
} from "@/mock/adapters/markets-workspace";
import { buildMarketsIntelligenceSurface } from "@/mock/adapters/markets-intelligence-build";
import { getSignalsRepository } from "@/features/signals/repository";

export {
  buildMarketAssetViews,
  computeMarketHero,
  getMockEconomicCalendar,
  getMockMarketNews,
  getMockPortfolioStrip,
} from "@/mock/adapters/markets-workspace";

/** Kart detayı — API’de order book / levels ile değiştirilebilir */
export function mockMarketDetailExtras(price: number, changePercent: number): MarketDetailExtras {
  const swing = Math.max(price * 0.012, price * 0.0008 * Math.abs(changePercent));
  return {
    support: Math.round((price - swing) * 100) / 100,
    resistance: Math.round((price + swing * 1.15) * 100) / 100,
    sentimentScore: Math.max(12, Math.min(88, 50 + changePercent * 5)),
    sentimentLabel: changePercent >= 0.2 ? "Bullish" : changePercent <= -0.2 ? "Bearish" : "Nötr",
    relatedSignalsCount: 3 + (Math.abs(changePercent * 10) | 0) % 8,
  };
}

export function getMockMarketsDashboardPayload(): MarketsHomePayload {
  const assets = buildMarketAssetViews();
  const sigIntel = getSignalsRepository().getMarketSignalIntelligence();
  return {
    assets,
    hero: computeMarketHero(assets, sigIntel),
    intelligence: buildMarketsIntelligenceSurface(assets, sigIntel),
  };
}

export function buildMockWatchlistMarketsContext(
  watchedSymbols: readonly string[],
  pinnedSymbols: readonly string[],
): WatchlistMarketsContext {
  const assets = buildMarketAssetViews();
  const watchSet = new Set(watchedSymbols.map((s) => s.trim().toUpperCase()).filter(Boolean));
  const watched = assets.filter((a) => watchSet.has(a.symbol.toUpperCase()));
  const movers: WatchlistMarketsContext["movers"] = [...watched]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 6)
    .map((a) => ({
      symbol: a.symbol,
      name: a.name,
      change_percent: a.change_percent,
      volume: a.volume,
    }));
  const signalCountOnWatch = watched.reduce((s, a) => s + a.signal_active_count, 0);
  const avgAbs =
    watched.length === 0 ? 0 : watched.reduce((acc, a) => acc + Math.abs(a.change_percent), 0) / watched.length;
  const pinnedCount = pinnedSymbols.filter((p) => watchSet.has(p.trim().toUpperCase())).length;
  const feed = getSignalsRepository().getFeedRows();
  const discussionScore = (sym: string) => {
    const u = sym.trim().toUpperCase();
    const rows = feed.filter((r) => r.symbol.toUpperCase() === u);
    let s = 0;
    for (const r of rows) {
      if (r.discussion_active) s += 4;
      s += Math.log1p(r.likes_count) * 0.85 + Math.log1p(r.community_copies_24h) * 1.2;
      if (r.creator_replied_recently) s += 2;
    }
    return s;
  };
  const topDiscussed = [...watched].sort((a, b) => discussionScore(b.symbol) - discussionScore(a.symbol))[0];
  const watchlistDiscussionBridge =
    watched.length === 0 || !topDiscussed
      ? null
      : {
          label: `${topDiscussed.symbol} üzerinde tartışma yoğunluğu öne çıkıyor`,
          symbol: topDiscussed.symbol,
          href: `/markets/${encodeURIComponent(topDiscussed.symbol)}`,
        };
  return {
    movers,
    signalCountOnWatch,
    watchedCount: watched.length,
    pinnedCount,
    avgAbsMovePct: Math.round(avgAbs * 100) / 100,
    watchlistDiscussionBridge,
  };
}

export function getMockAssetBySymbol(symbol: string): MarketAssetView | undefined {
  const u = symbol.trim().toUpperCase();
  return buildMarketAssetViews().find((a) => a.symbol.toUpperCase() === u);
}
