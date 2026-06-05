import type { MarketAssetView } from "@/features/markets/types";
import type {
  WatchlistIntelligenceBundle,
  WatchlistOnboardingIntel,
  WatchlistPersonalContext,
  PortfolioIntelligenceBundle,
} from "@/features/markets/types/personal-market-intelligence";
import { emptyWatchlistIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import { getSignalsRepository } from "@/features/signals/repository";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { buildMarketAssetViews, getMockEconomicCalendar } from "@/mock/adapters/markets-workspace";
import { MOCK_TREND_MARKETS } from "@/mock/fixtures/markets";
import { MOCK_PROFILES } from "@/mock/fixtures/profiles";

function symSet(symbols: readonly string[]): Set<string> {
  return new Set(symbols.map((x) => x.trim().toUpperCase()).filter(Boolean));
}

function rowsForWatch(feed: SignalsFeedRow[], watch: Set<string>): SignalsFeedRow[] {
  return feed.filter((r) => watch.has(r.symbol.toUpperCase()));
}

function discussionScoreRow(r: SignalsFeedRow): number {
  let s = 0;
  if (r.discussion_active) s += 4;
  s += Math.log1p(r.likes_count) * 0.85 + Math.log1p(r.community_copies_24h) * 1.2;
  if (r.creator_replied_recently) s += 2;
  return s;
}

function buildOnboarding(): WatchlistOnboardingIntel {
  const suggestedSymbols = MOCK_TREND_MARKETS.slice(0, 5).map((m) => ({
    symbol: m.symbol,
    name: m.name,
    hint: `${m.change_percent >= 0 ? "Isınan" : "Düzeltme"} akışı`,
    href: `/markets/${encodeURIComponent(m.symbol)}`,
  }));
  const trendingThemes = ["Likidite rotasyonu", "Kur koridoru", "Büyüme taşıyıcıları", "Emtia defansı"];
  const creatorPicks = MOCK_PROFILES.slice(0, 3).map((p) => ({
    display: p.full_name ?? p.username,
    href: `/channel/${p.id}`,
    reason: "Bu hafta piyasa odasında aktif",
  }));
  return {
    suggestedSymbols,
    trendingThemes,
    creatorPicks,
    starterLabel: "Takip listenizi bir komuta merkezine dönüştürün — aşağıdaki sembollerle başlayın.",
  };
}

export function buildWatchlistIntelligenceBundle(
  watchedSymbols: readonly string[],
  pinnedSymbols: readonly string[],
): WatchlistIntelligenceBundle {
  const watch = symSet(watchedSymbols);
  const pinned = symSet(pinnedSymbols);
  const assets = buildMarketAssetViews();
  const feed = getSignalsRepository().getFeedRows();
  const watchedAssets = assets.filter((a) => watch.has(a.symbol.toUpperCase()));

  if (watch.size === 0) {
    const base = emptyWatchlistIntelligenceBundle();
    return {
      ...base,
      onboarding: buildOnboarding(),
    };
  }

  const pinnedCount = [...pinned].filter((p) => watch.has(p)).length;
  const movers: WatchlistIntelligenceBundle["movers"] = [...watchedAssets]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 8)
    .map((a) => ({
      symbol: a.symbol,
      name: a.name,
      change_percent: a.change_percent,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
      signalCount: a.signal_active_count,
    }));

  const rw = rowsForWatch(feed, watch);
  const activeOnWatch = rw.filter((r) => r.is_active).length;
  const premiumOnWatch = rw.filter((r) => r.is_active && r.signal_access !== "public").length;
  const copies24h = rw.reduce((s, r) => s + r.community_copies_24h + r.subscriber_copies_24h, 0);
  const new24hLabel = `${Math.min(activeOnWatch, 5)} güncel çağrı penceresi`;

  const signalPulse: WatchlistIntelligenceBundle["signalPulse"] = {
    activeOnWatch,
    new24hLabel,
    premiumOnWatch,
    copies24h,
    summaryLabel: `${activeOnWatch} açık çağrı · ${premiumOnWatch} premium görünür`,
  };

  const creatorPulse = rw
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

  const discussionFeed = [...rw]
    .sort((a, b) => discussionScoreRow(b) - discussionScoreRow(a))
    .slice(0, 6)
    .map((r, i) => ({
      id: `wd-${r.id}`,
      symbol: r.symbol,
      headline: `${r.symbol} · ${r.direction} çağrısı tartışılıyor`,
      meta: `${r.likes_count} etkileşim`,
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
    .sort((a, b) => b.signal_active_count - a.signal_active_count)
    .slice(0, 4)
    .map((a, i) => ({
      symbol: a.symbol,
      name: a.name,
      deltaLabel: `+${(8 + (i * 5) % 14).toFixed(0)}% dikkat`,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
    }));

  const followedCreatorTouches = creatorPulseList.slice(0, 3).map((c) => ({
    symbol: c.symbol,
    creatorDisplay: c.display,
    href: c.href,
  }));

  const newPremiumSignals = [...new Map(rw.filter((r) => r.signal_access !== "public").map((r) => [r.symbol, r])).values()]
    .slice(0, 4)
    .map((r) => ({
      symbol: r.symbol,
      count: rw.filter((x) => x.symbol === r.symbol && x.signal_access !== "public").length,
      href: `/signals?asset=${encodeURIComponent(r.symbol)}`,
    }));

  const followedAnalystsOnWatch = creatorPulseList.slice(0, 3).map((c) => ({
    display: c.display,
    href: c.href,
    symbols: [...new Set(rw.filter((r) => r.analyst.display === c.display).map((r) => r.symbol))].slice(0, 3).join(" · "),
  }));

  const cal = getMockEconomicCalendar();
  const macroEventsForWatch = cal
    .filter((e) => e.affectedSymbols?.some((s) => watch.has(s.toUpperCase())))
    .slice(0, 4)
    .map((e) => ({
      id: e.id,
      title: e.title,
      href: "/economic-calendar",
      at: e.at,
    }));

  const heatLabel =
    discussionFeed.length >= 4 ? "Takip listenizde tartışma ısısı yüksek" : "Ölçülü tartışma profili";
  const bull = watchedAssets.filter((a) => a.signal_bull_pct >= 55).length;
  const convictionCluster =
    bull >= watchedAssets.length / 2 ? "Boğa kümesi ağırlıklı" : "Dengeli / seçici tezler";

  const personal: WatchlistPersonalContext = {
    risingAttention,
    followedCreatorTouches,
    newPremiumSignals,
    followedAnalystsOnWatch,
    sentimentShifts,
    macroEventsForWatch,
    heatLabel,
    convictionCluster,
  };

  const network: WatchlistIntelligenceBundle["network"] = {
    communityOverlap: "Takip listeniz topluluk sıcaklığı ile örtüşüyor (mock)",
    trendingCreatorAssets: risingAttention.slice(0, 3).map((x) => ({ symbol: x.symbol, href: x.href, score: 60 + x.symbol.length })),
    narrative: "Endeks ve kripto kolları birlikte hareket ediyor; takip listeniz bu akışa bağlı.",
    consensusShiftNote: "Kısa vadede güven bandı genişliyor (mock)",
  };

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
    network,
    onboarding: null,
  };
}

function categoryLabel(c: MarketAssetView["category"]): string {
  const m: Record<MarketAssetView["category"], string> = {
    crypto: "Kripto",
    stocks: "Hisse",
    forex: "Forex",
    commodity: "Emtia",
    index: "Endeks",
  };
  return m[c];
}

export function buildPortfolioIntelligenceBundle(): PortfolioIntelligenceBundle {
  const assets = buildMarketAssetViews();
  const pick = assets.slice(0, 6);
  const weights = [28, 22, 18, 14, 10, 8];
  const holdings: PortfolioIntelligenceBundle["holdings"] = pick.map((a, i) => ({
    symbol: a.symbol,
    name: a.name,
    weightPct: weights[i] ?? 10,
    category: categoryLabel(a.category),
    contributionLabel: a.change_percent >= 0 ? "Pozitif katkı" : "Çekiş",
    href: `/markets/${encodeURIComponent(a.symbol)}`,
  }));
  const portfolioSymbols = holdings.map((h) => h.symbol);
  const topW = Math.max(...holdings.map((h) => h.weightPct));
  const sectors = new Map<string, number>();
  for (const h of holdings) {
    sectors.set(h.category, (sectors.get(h.category) ?? 0) + h.weightPct);
  }
  const sectorTop = [...sectors.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, pct]) => ({ label, pct: Math.round(pct) }));

  const feed = getSignalsRepository().getFeedRows();
  const pfRows = feed.filter((r) => portfolioSymbols.includes(r.symbol));
  const analystCounts = new Map<string, { display: string; href: string; n: number }>();
  for (const r of pfRows) {
    const id = r.analyst.id;
    const cur = analystCounts.get(id) ?? { display: r.analyst.display, href: `/channel/${id}`, n: 0 };
    cur.n++;
    analystCounts.set(id, cur);
  }
  const overlappingAnalysts = [...analystCounts.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, 4)
    .map((x) => ({ display: x.display, href: x.href, count: x.n }));

  const risk: PortfolioIntelligenceBundle["risk"] = {
    concentrationLabel: topW >= 26 ? "Üst ağırlık yoğun" : "Dağılım dengeli",
    topWeightPct: topW,
    sectorTop,
    macroSensitivity: "Fed yolu + kur koridoru (mock)",
    correlatedPairs: [
      { a: pick[0]?.symbol ?? "BTC", b: pick[1]?.symbol ?? "ETH", note: "Yüksek β" },
      { a: pick[2]?.symbol ?? "XU100", b: pick[3]?.symbol ?? "USDTRY", note: "Yerel beta" },
    ],
    volCluster: "Orta vol kümesi",
    regimeAlignment: "Risk-on eğilimli",
    momentumVsDefense: "Momentum %62 · defansif %38",
  };

  const overlaps: PortfolioIntelligenceBundle["overlaps"] = {
    creatorConcentration: overlappingAnalysts.length ? `${overlappingAnalysts[0]!.display} ağırlıklı` : "Dağınık üretici",
    signalThemeTop: pfRows.length ? `${pfRows[0]!.symbol} çağrı teması` : "Sinyal kesişimi düşük",
    overlappingAnalysts,
  };

  const bullW = holdings.filter((h) => {
    const ax = assets.find((x) => x.symbol === h.symbol);
    return ax && ax.change_percent >= 0;
  });
  const headlineSentiment =
    bullW.length >= holdings.length / 2 ? "Portföy risk iştahı pozitif" : "Portföy temkinli / dengeli";

  const strategyMix = [
    { label: "Swing", pct: 44 },
    { label: "Pozisyon", pct: 32 },
    { label: "Hedge", pct: 24 },
  ];

  return {
    headlineSentiment,
    strategyMix,
    holdings,
    risk,
    overlaps,
    portfolioSymbols,
  };
}
