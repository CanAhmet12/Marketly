import { parseVolumeRough } from "@/features/markets/lib/filter-assets";
import { MARKETS_HUB_PATH, marketSymbolPath } from "@/features/markets/markets-routes";
import type { MarketAssetView } from "@/features/markets/types";
import type {
  MarketCrossAssetDiscussionChain,
  MarketsAnalystAttentionSurface,
  MarketsCommunityIntelligenceSurface,
  MarketsDiscussionSocialRow,
  MarketsIntelligenceSurface,
  MarketsLiveConversationPulse,
  MarketsMoversBoard,
  MarketsSegmentNarratives,
  MarketsSignalHeatSurface,
  MarketIntelMoverRow,
} from "@/features/markets/types/markets-intelligence";
import type { MarketSignalIntelligence } from "@/features/signals/intelligence/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { getSignalsRepository } from "@/features/signals/repository";

function toMover(a: MarketAssetView, hint?: string): MarketIntelMoverRow {
  return {
    symbol: a.symbol,
    name: a.name,
    change_percent: a.change_percent,
    volume: a.volume,
    metricHint: hint,
  };
}

function rowsForSymbol(feed: SignalsFeedRow[], symbol: string): SignalsFeedRow[] {
  const u = symbol.trim().toUpperCase();
  return feed.filter((r) => r.symbol.toUpperCase() === u);
}

function discussionScore(rows: SignalsFeedRow[]): number {
  let s = 0;
  for (const r of rows) {
    if (r.discussion_active) s += 4;
    s += Math.log1p(r.likes_count) * 0.85 + Math.log1p(r.community_copies_24h) * 1.2;
    if (r.creator_replied_recently) s += 2;
  }
  return s;
}

function copyScore(rows: SignalsFeedRow[]): number {
  return rows.reduce((acc, r) => acc + r.community_copies_24h + r.subscriber_copies_24h * 1.15, 0);
}

function premiumSharePct(rows: SignalsFeedRow[]): number {
  if (!rows.length) return 0;
  const p = rows.filter((r) => r.signal_access !== "public").length;
  return Math.round((p / rows.length) * 100);
}

function buildMoversBoard(assets: MarketAssetView[]): MarketsMoversBoard {
  const gainers = [...assets].sort((a, b) => b.change_percent - a.change_percent).slice(0, 4).map((a) => toMover(a));
  const losers = [...assets].sort((a, b) => a.change_percent - b.change_percent).slice(0, 4).map((a) => toMover(a));
  const highVolume = [...assets].sort((a, b) => parseVolumeRough(b.volume) - parseVolumeRough(a.volume)).slice(0, 4).map((a) => toMover(a, "Hacim"));
  const highVolatility = [...assets]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 4)
    .map((a) => toMover(a, "σ"));
  const signalHeat = [...assets].sort((a, b) => b.signal_active_count - a.signal_active_count).slice(0, 4).map((a) => toMover(a, "Sinyal"));
  const analystAttention = [...assets]
    .filter((a) => a.signal_top_analyst)
    .sort((a, b) => b.signal_active_count - a.signal_active_count)
    .slice(0, 4)
    .map((a) => toMover(a, "Analist"));
  return { gainers, losers, highVolume, highVolatility, signalHeat, analystAttention };
}

function buildSignalHeatSurface(assets: MarketAssetView[], sig: MarketSignalIntelligence): MarketsSignalHeatSurface {
  const feed = getSignalsRepository().getFeedRows();
  const top = [...assets].sort((a, b) => b.signal_active_count - a.signal_active_count).slice(0, 6);
  const topByActiveSignals = top.map((a) => {
    const rs = rowsForSymbol(feed, a.symbol);
    const cons = getSignalsRepository().getSymbolConsensusIntel(a.symbol);
    const conviction = cons.strongestConviction ?? cons.confidenceAvg ?? 0;
    return {
      symbol: a.symbol,
      name: a.name,
      activeSignals: a.signal_active_count,
      bullPct: a.signal_bull_pct,
      convictionScore: Math.round(conviction),
      discussionScore: Math.round(discussionScore(rs) * 10) / 10,
      copyScore: Math.round(copyScore(rs)),
      premiumAnalystPct: premiumSharePct(rs),
    };
  });
  return {
    marketBias: sig.marketBias,
    bullPct: sig.bullBearSplitPct.bull,
    bearPct: sig.bullBearSplitPct.bear,
    activeDebateAssetCount: sig.activeDebateAssetCount,
    momentumLabel: sig.momentumLabel,
    themeAcceleration: sig.themeAcceleration,
    analystConcentrationTop: sig.analystConcentrationTop,
    topByActiveSignals,
  };
}

function buildAnalystAttention(assets: MarketAssetView[]): MarketsAnalystAttentionSurface {
  const feed = getSignalsRepository().getFeedRows();
  const analystFocusSymbols = [...assets]
    .sort((a, b) => b.signal_active_count - a.signal_active_count)
    .slice(0, 5)
    .map((a, i) => ({
      symbol: a.symbol,
      name: a.name,
      analystTouches: 3 + (a.signal_active_count % 5) + i,
      discussionRising: discussionScore(rowsForSymbol(feed, a.symbol)) > 6,
    }));

  const risingDiscussion = [...assets]
    .map((a) => ({
      symbol: a.symbol,
      name: a.name,
      score: discussionScore(rowsForSymbol(feed, a.symbol)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const creatorHot = [...assets]
    .map((a) => ({
      symbol: a.symbol,
      name: a.name,
      activityScore: copyScore(rowsForSymbol(feed, a.symbol)) + a.signal_active_count * 2,
    }))
    .sort((a, b) => b.activityScore - a.activityScore)
    .slice(0, 4);

  const sections = getSignalsRepository().getAnalystLeaderboardSections();
  const pick = (id: string, n: number) => {
    const s = sections.find((x) => x.id === id);
    if (!s?.rows.length) return [];
    return s.rows.slice(0, n).map((r) => ({
      display: r.display,
      href: r.href,
      badge: r.primaryMetricLabel,
    }));
  };

  const segmentLeaders: MarketsAnalystAttentionSurface["segmentLeaders"] = {
    crypto: pick("best_crypto", 2),
    stocks: pick("best_equity", 2),
    forex: pick("best_macro", 2),
    index: pick("best_macro", 2),
    commodity: pick("top_analysts", 2),
  };

  return { analystFocusSymbols, risingDiscussion, creatorHot, segmentLeaders };
}

function buildSegmentNarratives(assets: MarketAssetView[]): MarketsSegmentNarratives {
  const count = (c: MarketAssetView["category"]) => assets.filter((a) => a.category === c).length;
  const volLabel = (c: MarketAssetView["category"]) => {
    const xs = assets.filter((a) => a.category === c).map((a) => Math.abs(a.change_percent));
    if (!xs.length) return "—";
    const m = xs.reduce((a, b) => a + b, 0) / xs.length;
    return m >= 1.1 ? "yüksek hareket" : m >= 0.45 ? "ölçülü hareket" : "sıkı seans";
  };
  return {
    all: `Tüm piyasalar · ${assets.length} sembol · komuta özeti`,
    crypto: `Kripto (${count("crypto")}) · ${volLabel("crypto")} · ETF ve likidite akışı`,
    stocks: `BIST / hisse (${count("stocks")}) · ${volLabel("stocks")} · bilanço sezonu hazırlığı`,
    forex: `Döviz (${count("forex")}) · ${volLabel("forex")} · kur koridoru`,
    commodity: `Emtia (${count("commodity")}) · ${volLabel("commodity")} · emtia defansı`,
    index: `Endeks (${count("index")}) · ${volLabel("index")} · risk iştahı taşıyıcıları`,
    watchlist: "Tarayıcıda saklanan takip listeniz — sinyal ve hareket bağlamı",
  };
}

function buildLiveConversationPulse(
  assets: MarketAssetView[],
  sig: MarketSignalIntelligence,
  feed: SignalsFeedRow[],
): MarketsLiveConversationPulse {
  const withDiscuss = feed.filter((r) => r.discussion_active);
  const creatorsDiscussing = withDiscuss.slice(0, 6).map((r) => ({
    display: r.analyst.display,
    href: `/channel/${r.analyst.id}`,
    assetSymbol: r.symbol,
    live: Boolean(r.creator_replied_recently),
  }));
  const uniq = new Map<string, (typeof creatorsDiscussing)[0]>();
  for (const c of creatorsDiscussing) {
    if (!uniq.has(c.href)) uniq.set(c.href, c);
  }
  const themes = [...new Set(assets.slice(0, 8).map((a) => `${a.symbol} akışı`))].slice(0, 3);
  return {
    activeNowLabel: sig.activeDebateAssetCount > 0 ? "Tartışma odaları açık" : "Ölçülü seans",
    activeRoomsCount: Math.max(2, Math.min(24, sig.activeDebateAssetCount + 2)),
    fastMovingThreadCount: Math.min(18, withDiscuss.length + (sig.activeDebateAssetCount > 4 ? 4 : 0)),
    sentimentShiftLabel: `${sig.momentumLabel} · ${sig.bullBearSplitPct.bull}% boğa`,
    macroFocusLabel: sig.themeAcceleration,
    creatorsDiscussing: [...uniq.values()].slice(0, 5),
    breakingThemes: themes,
  };
}

function buildCommunityIntelSurface(
  assets: MarketAssetView[],
  analystAttention: MarketsAnalystAttentionSurface,
  signalHeat: MarketsSignalHeatSurface,
  feed: SignalsFeedRow[],
): MarketsCommunityIntelligenceSurface {
  const hottestDebates = analystAttention.risingDiscussion.slice(0, 4).map((x, i) => ({
    symbol: x.symbol,
    name: x.name,
    score: Math.round(x.score * 10) / 10,
    stanceSplitLabel: `Boğa %${Math.min(88, 42 + ((i * 11 + x.score) | 0) % 38)}`,
    href: `/signals?asset=${encodeURIComponent(x.symbol)}`,
  }));
  const mostWatched = [...assets]
    .sort((a, b) => b.signal_active_count + parseVolumeRough(b.volume) / 1e9 - (a.signal_active_count + parseVolumeRough(a.volume) / 1e9))
    .slice(0, 4)
    .map((a, i) => ({
      symbol: a.symbol,
      name: a.name,
      watchersScore: Math.round(40 + a.signal_active_count * 6 + (i + 1) * 8),
      href: marketSymbolPath(a.symbol),
    }));
  const risingCommunityAttention = analystAttention.creatorHot.slice(0, 4).map((x, i) => ({
    symbol: x.symbol,
    name: x.name,
    deltaLabel: `+${(12 + (i * 7) % 20).toFixed(0)}% dikkat`,
    href: marketSymbolPath(x.symbol),
  }));
  const sections = getSignalsRepository().getAnalystLeaderboardSections();
  const topRows = sections.flatMap((s) => s.rows).slice(0, 4);
  const creatorOverlapLeaders = topRows.map((r, i) => ({
    display: r.display,
    href: r.href,
    sharedAssetCount: 3 + (i % 5),
    topSymbol: assets[i % assets.length]?.symbol ?? "—",
  }));
  const activeDiscussionCount = feed.filter((r) => r.discussion_active).length + signalHeat.activeDebateAssetCount * 2;
  const participationDensityPct = Math.min(94, 28 + Math.round(signalHeat.bullPct / 3) + (assets.length % 11));
  const analystPct = Math.min(72, 52 + (feed.length % 15));
  const analystVsCommunitySplitLabel = `Analist ağırlığı %${analystPct} · topluluk %${100 - analystPct}`;
  return {
    activeDiscussionCount,
    hottestDebates,
    mostWatched,
    risingCommunityAttention,
    creatorOverlapLeaders,
    discussionMomentumLabel: `${signalHeat.momentumLabel} — tartışma hızı`,
    participationDensityPct,
    analystVsCommunitySplitLabel,
  };
}

function hasSym(assets: MarketAssetView[], s: string): boolean {
  const u = s.trim().toUpperCase();
  return assets.some((a) => a.symbol.toUpperCase() === u);
}

function buildCrossAssetChains(assets: MarketAssetView[]): MarketCrossAssetDiscussionChain[] {
  const templates: { left: string; right: string; theme: string; href: string }[] = [
    { left: "BTC", right: "ETH", theme: "Likidite & korelasyon", href: MARKETS_HUB_PATH },
    { left: "BTC", right: "SOL", theme: "Alt-L1 rotasyonu", href: MARKETS_HUB_PATH },
    { left: "XU100", right: "THYAO", theme: "Endeks taşıyıcıları", href: "/markets/XU100" },
    { left: "XAUUSD", right: "USDTRY", theme: "Altın ↔ kur", href: "/markets/XAUUSD" },
    { left: "NDX", right: "AAPL", theme: "Büyüme taşıyıcıları", href: "/markets/NDX" },
  ];
  const out: MarketCrossAssetDiscussionChain[] = [];
  templates.forEach((t, idx) => {
    if (!hasSym(assets, t.left) || !hasSym(assets, t.right)) return;
    out.push({
      id: `xchain-${t.left}-${t.right}-${idx}`,
      leftSymbol: t.left,
      rightSymbol: t.right,
      theme: t.theme,
      intensityLabel: idx % 2 === 0 ? "Sıcak" : "Isınan",
      href: t.href,
    });
  });
  return out.slice(0, 5);
}

function buildDiscussionSocialMechanics(feed: SignalsFeedRow[]): MarketsDiscussionSocialRow[] {
  const active = feed.filter((r) => r.is_active).slice(0, 8);
  const kinds: MarketsDiscussionSocialRow["kind"][] = [
    "tracking",
    "thesis_reaction",
    "conviction_reaction",
    "follow_discussion",
    "creator_reply",
    "copied_thesis",
    "sentiment",
  ];
  return active.slice(0, 6).map((r, i) => ({
    id: `soc-${r.id}`,
    kind: kinds[i % kinds.length]!,
    headline:
      kinds[i % kinds.length] === "creator_reply"
        ? `${r.analyst.display} yanıt verdi`
        : kinds[i % kinds.length] === "copied_thesis"
          ? "Tez kopyalandı"
          : `${r.symbol} tartışması`,
    detail: `${r.direction} · güven %${r.confidence}`,
    href: `/signals?asset=${encodeURIComponent(r.symbol)}`,
    symbol: r.symbol,
  }));
}

export function buildMarketsIntelligenceSurface(
  assets: MarketAssetView[],
  signalMarket: MarketSignalIntelligence,
): MarketsIntelligenceSurface {
  const feed = getSignalsRepository().getFeedRows();
  const movers = buildMoversBoard(assets);
  const signalHeat = buildSignalHeatSurface(assets, signalMarket);
  const analystAttention = buildAnalystAttention(assets);
  const segmentNarratives = buildSegmentNarratives(assets);
  const liveConversation = buildLiveConversationPulse(assets, signalMarket, feed);
  const communityIntel = buildCommunityIntelSurface(assets, analystAttention, signalHeat, feed);
  const crossAssetChains = buildCrossAssetChains(assets);
  const discussionSocialMechanics = buildDiscussionSocialMechanics(feed);
  return {
    movers,
    signalHeat,
    analystAttention,
    segmentNarratives,
    liveConversation,
    communityIntel,
    crossAssetChains,
    discussionSocialMechanics,
  };
}
