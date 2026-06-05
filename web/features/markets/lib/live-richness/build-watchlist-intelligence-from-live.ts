import type { MarketAssetView } from "@/features/markets/types";
import type {
  WatchlistIntelligenceBundle,
  WatchlistOnboardingIntel,
} from "@/features/markets/types/personal-market-intelligence";
import { emptyWatchlistIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

function symSet(symbols: readonly string[]): Set<string> {
  return new Set(symbols.map((x) => x.trim().toUpperCase()).filter(Boolean));
}

function rowsForWatch(feed: readonly SignalsFeedRow[], watch: Set<string>): SignalsFeedRow[] {
  return feed.filter((r) => watch.has(r.symbol.toUpperCase()));
}

function discussionScoreRow(r: SignalsFeedRow): number {
  let s = 0;
  if (r.discussion_active) s += 4;
  s += Math.log1p(r.likes_count) * 0.85 + Math.log1p(r.community_copies_24h) * 1.2;
  if (r.creator_replied_recently) s += 2;
  return s;
}

function buildOnboardingFromAssets(assets: readonly MarketAssetView[]): WatchlistOnboardingIntel {
  const suggested = [...assets]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 5)
    .map((m) => ({
      symbol: m.symbol,
      name: m.name,
      hint: `${m.change_percent >= 0 ? "Isınan" : "Düzeltme"} akışı`,
      href: `/markets/${encodeURIComponent(m.symbol)}`,
    }));
  const cats = new Set(assets.map((a) => a.category));
  const trendingThemes = [...cats].map((c) => {
    const label: Record<MarketAssetView["category"], string> = {
      crypto: "Kripto momentum",
      stocks: "Hisse rotasyonu",
      forex: "Kur koridoru",
      commodity: "Emtia defansı",
      index: "Endeks takibi",
    };
    return label[c];
  });
  return {
    suggestedSymbols: suggested,
    trendingThemes: trendingThemes.length ? trendingThemes : ["Likidite", "Volatilite"],
    creatorPicks: [],
    starterLabel: "Takip listenizi bir komuta merkezine dönüştürün — aşağıdaki sembollerle başlayın.",
  };
}

export type BuildWatchlistIntelInput = {
  watchedSymbols: readonly string[];
  pinnedSymbols: readonly string[];
  assets: readonly MarketAssetView[];
  signals: readonly SignalsFeedRow[];
};

/** Live watchlist intelligence — mock import yok. */
export function buildWatchlistIntelligenceFromLive(input: BuildWatchlistIntelInput): WatchlistIntelligenceBundle {
  const { watchedSymbols, pinnedSymbols, assets, signals } = input;
  const watch = symSet(watchedSymbols);
  const pinned = symSet(pinnedSymbols);
  const watchedAssets = assets.filter((a) => watch.has(a.symbol.toUpperCase()));

  if (watch.size === 0) {
    const base = emptyWatchlistIntelligenceBundle();
    return {
      ...base,
      onboarding: assets.length > 0 ? buildOnboardingFromAssets(assets) : base.onboarding,
    };
  }

  const pinnedCount = [...pinned].filter((p) => watch.has(p)).length;
  const symRows = rowsForWatch(signals, watch);

  const movers: WatchlistIntelligenceBundle["movers"] = [...watchedAssets]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 8)
    .map((a) => ({
      symbol: a.symbol,
      name: a.name,
      change_percent: a.change_percent,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
      signalCount: symRows.filter((r) => r.is_active && r.symbol.toUpperCase() === a.symbol.toUpperCase()).length,
    }));

  const activeOnWatch = symRows.filter((r) => r.is_active).length;
  const premiumOnWatch = symRows.filter((r) => r.is_active && r.signal_access !== "public").length;
  const copies24h = symRows.reduce((s, r) => s + r.community_copies_24h + r.subscriber_copies_24h, 0);

  const signalPulse: WatchlistIntelligenceBundle["signalPulse"] = {
    activeOnWatch,
    new24hLabel: `${Math.min(activeOnWatch, 5)} güncel çağrı`,
    premiumOnWatch,
    copies24h,
    summaryLabel: `${activeOnWatch} açık çağrı · ${premiumOnWatch} premium görünür`,
  };

  const creatorPulse = symRows
    .filter((r) => r.is_active)
    .slice(0, 6)
    .map((r) => ({
      display: r.analyst.display,
      href: `/channel/${r.analyst.id}`,
      symbol: r.symbol,
      note: r.creator_replied_recently ? "Son yanıt verdi" : "Takipte",
    }));
  const uniqCreators = new Map<string, (typeof creatorPulse)[0]>();
  for (const c of creatorPulse) {
    if (!uniqCreators.has(c.href)) uniqCreators.set(c.href, c);
  }
  const creatorPulseList = [...uniqCreators.values()].slice(0, 5);

  const sentimentShifts = watchedAssets.slice(0, 4).map((a) => ({
    symbol: a.symbol,
    label: a.change_percent >= 0.4 ? "Risk iştahı taşıyıcı" : a.change_percent <= -0.4 ? "Koruma aranıyor" : "Nötr bant",
    href: `/markets/${encodeURIComponent(a.symbol)}`,
  }));

  const discussionFeed = [...symRows]
    .sort((a, b) => discussionScoreRow(b) - discussionScoreRow(a))
    .slice(0, 6)
    .map((r, i) => ({
      id: `wd-${r.id}`,
      symbol: r.symbol,
      headline: `${r.symbol} · ${r.direction} çağrısı`,
      meta: `${r.likes_count} etkileşim · %${r.confidence}`,
      href: `/signals?asset=${encodeURIComponent(r.symbol)}`,
      live: i < 2 && r.discussion_active,
    }));

  const volatility = [...watchedAssets]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 5)
    .map((a) => ({
      symbol: a.symbol,
      label: `σ ${Math.abs(a.change_percent).toFixed(2)}%`,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
    }));

  const risingAttention = [...watchedAssets]
    .sort((a, b) => b.signal_active_count - a.signal_active_count || Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 4)
    .map((a, i) => ({
      symbol: a.symbol,
      name: a.name,
      deltaLabel: `${a.signal_active_count} sinyal · ${a.change_percent >= 0 ? "+" : ""}${a.change_percent.toFixed(2)}%`,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
    }));

  const bull = watchedAssets.filter((a) => a.change_percent > 0).length;
  const convictionCluster =
    bull >= watchedAssets.length / 2 ? "Pozitif momentum kümesi" : "Dengeli / seçici tezler";

  const personal: WatchlistIntelligenceBundle["personal"] = {
    risingAttention,
    followedCreatorTouches: creatorPulseList.slice(0, 3).map((c) => ({
      symbol: c.symbol,
      creatorDisplay: c.display,
      href: c.href,
    })),
    newPremiumSignals: [...new Map(symRows.filter((r) => r.signal_access !== "public").map((r) => [r.symbol, r])).values()]
      .slice(0, 4)
      .map((r) => ({
        symbol: r.symbol,
        count: symRows.filter((x) => x.symbol === r.symbol && x.signal_access !== "public").length,
        href: `/signals?asset=${encodeURIComponent(r.symbol)}`,
      })),
    followedAnalystsOnWatch: creatorPulseList.slice(0, 3).map((c) => ({
      display: c.display,
      href: c.href,
      symbols: [...new Set(symRows.filter((r) => r.analyst.display === c.display).map((r) => r.symbol))].slice(0, 3).join(" · "),
    })),
    sentimentShifts,
    macroEventsForWatch: [],
    heatLabel: discussionFeed.length >= 3 ? "Takip listenizde sinyal ısısı yüksek" : "Ölçülü sinyal profili",
    convictionCluster,
  };

  const avgChg =
    watchedAssets.length > 0
      ? watchedAssets.reduce((s, a) => s + a.change_percent, 0) / watchedAssets.length
      : 0;

  return {
    watchedCount: watch.size,
    pinnedCount,
    movers,
    signalPulse,
    creatorPulse: creatorPulseList,
    sentimentShifts,
    discussionFeed,
    volatility,
    personal,
    network: {
      communityOverlap: activeOnWatch > 0 ? "Sinyal akışı takip listesiyle örtüşüyor" : "Sakin sinyal profili",
      trendingCreatorAssets: risingAttention.slice(0, 3).map((x) => ({
        symbol: x.symbol,
        href: x.href,
        score: 50 + Math.round(Math.abs(watchedAssets.find((a) => a.symbol === x.symbol)?.change_percent ?? 0) * 10),
      })),
      narrative:
        avgChg >= 0.5
          ? "Takip listenizde pozitif momentum baskın."
          : avgChg <= -0.5
            ? "Takip listenizde koruma teması öne çıkıyor."
            : "Takip listeniz nötr bantta.",
      consensusShiftNote:
        signalPulse.activeOnWatch > 0
          ? `${signalPulse.activeOnWatch} aktif çağrı izleniyor`
          : "Aktif çağrı yok",
    },
    onboarding: null,
  };
}
