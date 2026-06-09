import type { MarketNewsDbRow } from "@/features/markets/fetch-market-news";
import { emptyAssetIntelligenceBundle } from "@/features/markets/lib/asset-intelligence-empty";
import type { MarketAssetView } from "@/features/markets/types";
import type {
  AssetHeroIntel,
  AssetIntelligenceBundle,
  AssetMarketNewsItem,
  AssetRelatedCreator,
  AssetStatRow,
  AssetTopAnalyst,
} from "@/features/markets/types/asset-intelligence";
import { marketAssetCategoryLabelTr } from "@/features/markets/types/asset-intelligence";
import { findAsset } from "@/features/markets/lib/live-category/live-category-shared";
import {
  buildMarketSignalIntelligence,
  buildSymbolConsensusIntel,
} from "@/features/signals/lib/signal-intelligence-build";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

export type BuildAssetIntelInput = {
  symbol: string;
  asset: MarketAssetView;
  allAssets: readonly MarketAssetView[];
  signals: readonly SignalsFeedRow[];
  newsRows: readonly MarketNewsDbRow[];
};

function symKey(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function minutesSince(iso: string): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 60_000));
}

function signalRowsForSymbol(rows: readonly SignalsFeedRow[], symbol: string): SignalsFeedRow[] {
  const key = symKey(symbol);
  return rows.filter((r) => symKey(r.symbol) === key);
}

export function enrichAssetWithSignals(asset: MarketAssetView, symRows: SignalsFeedRow[]): MarketAssetView {
  const active = symRows.filter((r) => r.is_active);
  const buy = active.filter((r) => r.direction === "BUY").length;
  const sell = active.filter((r) => r.direction === "SELL").length;
  const bs = buy + sell;
  const bullPct = bs > 0 ? Math.round((buy / bs) * 100) : 50;
  const top = [...active].sort((a, b) => b.confidence - a.confidence)[0];
  return {
    ...asset,
    signal_active_count: active.length,
    signal_bull_pct: bullPct,
    signal_top_analyst: top?.analyst.display ?? null,
  };
}

function confidenceBins(rows: SignalsFeedRow[]): AssetIntelligenceBundle["confidenceBins"] {
  const active = rows.filter((r) => r.is_active);
  let high = 0;
  let mid = 0;
  let low = 0;
  for (const r of active) {
    if (r.confidence >= 70) high++;
    else if (r.confidence >= 50) mid++;
    else low++;
  }
  return { high, mid, low };
}

function signalSummary(rows: SignalsFeedRow[]): AssetIntelligenceBundle["signalSummary"] {
  const active = rows.filter((r) => r.is_active);
  const activeBuy = active.filter((r) => r.direction === "BUY").length;
  const activeSell = active.filter((r) => r.direction === "SELL").length;
  const activeHold = active.filter((r) => r.direction === "HOLD").length;
  const avg =
    active.length > 0 ? Math.round(active.reduce((s, r) => s + r.confidence, 0) / active.length) : 0;
  const bs = activeBuy + activeSell;
  const bullSharePct = bs > 0 ? Math.round((activeBuy / bs) * 100) : 50;
  const closed = rows
    .filter((r) => !r.is_active && (r.result === "TP" || r.result === "SL"))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)
    .map((r) => ({
      id: r.id,
      direction: r.direction,
      result: r.result,
      confidence: r.confidence,
      analyst: r.analyst.display,
      at: r.created_at,
    }));
  return {
    activeTotal: active.length,
    activeBuy,
    activeSell,
    activeHold,
    avgConfidenceActive: avg,
    bullSharePct,
    recentClosed: closed,
  };
}

function topAnalysts(rows: SignalsFeedRow[]): AssetTopAnalyst[] {
  const active = rows.filter((r) => r.is_active);
  const m = new Map<
    string,
    { display: string; avatar: string | null; verified: boolean; confs: number[]; buy: number; sell: number }
  >();
  for (const r of active) {
    const id = r.analyst.id;
    const cur = m.get(id) ?? {
      display: r.analyst.display,
      avatar: r.analyst.avatar_url,
      verified: r.analyst.verified,
      confs: [],
      buy: 0,
      sell: 0,
    };
    cur.confs.push(r.confidence);
    if (r.direction === "BUY") cur.buy++;
    if (r.direction === "SELL") cur.sell++;
    m.set(id, cur);
  }
  return [...m.entries()]
    .map(([analystId, v]) => {
      const avgConf = v.confs.length ? Math.round(v.confs.reduce((a, b) => a + b, 0) / v.confs.length) : 0;
      const bias: AssetTopAnalyst["bias"] =
        v.buy > v.sell * 1.2 ? "bullish" : v.sell > v.buy * 1.2 ? "bearish" : "mixed";
      return {
        analystId,
        display: v.display,
        avatarUrl: v.avatar,
        verified: v.verified,
        activeCount: v.confs.length,
        avgConfidence: avgConf,
        bias,
      };
    })
    .sort((a, b) => b.activeCount - a.activeCount || b.avgConfidence - a.avgConfidence)
    .slice(0, 4);
}

function buildHeroIntel(asset: MarketAssetView, symRows: SignalsFeedRow[]): AssetHeroIntel {
  const active = symRows.filter((r) => r.is_active);
  const absChg = Math.abs(asset.change_percent);
  const volatilityRegime: AssetHeroIntel["volatilityRegime"] =
    absChg >= 2.5 ? "expanded" : absChg >= 0.8 ? "normal" : "quiet";
  const consensusDirection: AssetHeroIntel["consensusDirection"] =
    asset.signal_bull_pct >= 58 ? "bullish" : asset.signal_bull_pct <= 42 ? "bearish" : "neutral";
  const trendAcceleration: AssetHeroIntel["trendAcceleration"] =
    asset.change_percent >= 1.2 ? "heating" : asset.change_percent <= -1.2 ? "cooling" : "steady";
  const analystIds = new Set(active.map((r) => r.analyst.id));
  const premiumPct =
    active.length > 0
      ? Math.round((active.filter((r) => r.signal_access !== "public").length / active.length) * 100)
      : 0;

  let sentimentPulse = "Nötr bant — net yön sınırlı.";
  if (asset.change_percent >= 1.5) sentimentPulse = "Risk iştahı artıyor; hacim teyidi izlenmeli.";
  else if (asset.change_percent <= -1.5) sentimentPulse = "Koruma aranıyor; kısa vadeli baskı baskın.";
  if (active.length >= 3) {
    sentimentPulse += ` ${active.length} aktif çağrı konsensüsü ${consensusDirection === "bullish" ? "alım" : consensusDirection === "bearish" ? "satım" : "karışık"}.`;
  }

  return {
    sentimentPulse,
    consensusDirection,
    volatilityRegime,
    volatilityLabel: `${absChg.toFixed(2)}% günlük`,
    momentumLabel: `${asset.change_percent >= 0 ? "+" : ""}${asset.change_percent.toFixed(2)}%`,
    trendAcceleration,
    watchlistActivityLabel: active.length > 0 ? "Sinyal akışı aktif" : "Sinyal akışı sakin",
    premiumAnalystPct: premiumPct,
    signalActivityLabel: `${active.length} aktif çağrı`,
    activeAnalystsLabel: `${analystIds.size} analist`,
  };
}

function buildNews(symbol: string, newsRows: readonly MarketNewsDbRow[]): AssetMarketNewsItem[] {
  const key = symKey(symbol);
  return newsRows
    .filter((n) => (n.related_symbols ?? []).some((s) => symKey(s) === key) || n.title.toUpperCase().includes(key))
    .slice(0, 6)
    .map((n, i): AssetMarketNewsItem => {
      const sent = (n.sentiment ?? "neutral").toLowerCase();
      const sentiment: AssetMarketNewsItem["sentiment"] =
        sent === "positive" ? "positive" : sent === "negative" ? "negative" : sent === "mixed" ? "mixed" : "neutral";
      const cat = (n.category ?? "macro").toLowerCase();
      const category: AssetMarketNewsItem["category"] =
        cat.includes("earn") ? "earnings" : cat.includes("flow") ? "flows" : cat.includes("tech") ? "technical" : cat.includes("policy") ? "policy" : "macro";
      return {
        id: n.id,
        headline: n.title,
        source: n.source,
        minutesAgo: minutesSince(n.published_at),
        impact: ((i % 3) + 1) as 1 | 2 | 3,
        category,
        sentiment,
      };
    });
}

function buildStats(asset: MarketAssetView): AssetStatRow[] {
  const support = Math.round(asset.price * 0.99 * 100) / 100;
  const resistance = Math.round(asset.price * 1.01 * 100) / 100;
  const sentLabel =
    asset.change_percent >= 1 ? "Pozitif" : asset.change_percent <= -1 ? "Negatif" : "Nötr";
  return [
    { key: "mcap", label: "Piyasa değeri", value: asset.marketCapLabel },
    { key: "vol", label: "Hacim (24s)", value: asset.volume },
    { key: "chg", label: "Günlük %", value: `${asset.change_percent >= 0 ? "+" : ""}${asset.change_percent.toFixed(2)}%` },
    { key: "sent", label: "Desk hissiyat", value: sentLabel, hint: "Fiyat aksiyonundan türetildi" },
    { key: "sup", label: "Destek", value: support.toLocaleString("tr-TR") },
    { key: "res", label: "Direnç", value: resistance.toLocaleString("tr-TR") },
    { key: "sig", label: "Aktif sinyal", value: String(asset.signal_active_count) },
  ];
}

function relatedCreators(symRows: SignalsFeedRow[]): AssetRelatedCreator[] {
  const seen = new Set<string>();
  const out: AssetRelatedCreator[] = [];
  for (const r of symRows.filter((x) => x.is_active)) {
    if (seen.has(r.analyst.id)) continue;
    seen.add(r.analyst.id);
    out.push({
      id: r.analyst.id,
      display: r.analyst.display,
      username: r.analyst.display,
      avatarUrl: r.analyst.avatar_url,
      verified: r.analyst.verified,
      role: "Sinyal & akış",
      href: `/channel/${r.analyst.id}`,
    });
    if (out.length >= 4) break;
  }
  return out;
}

function relatedNetwork(asset: MarketAssetView, allAssets: readonly MarketAssetView[]): AssetIntelligenceBundle["relatedNetwork"] {
  const peers = allAssets
    .filter((a) => a.category === asset.category && symKey(a.symbol) !== symKey(asset.symbol))
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 4)
    .map((a) => ({
      symbol: a.symbol,
      correlationLabel: `${a.change_percent >= 0 ? "+" : ""}${a.change_percent.toFixed(2)}%`,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
    }));

  const themeLabel = marketAssetCategoryLabelTr(asset.category);
  return {
    correlated: peers,
    themeClusters: peers.length ? [{ label: themeLabel, symbols: [asset.symbol, ...peers.map((p) => p.symbol)].slice(0, 4) }] : [],
    macroThemes: [themeLabel],
    analystOverlap: [],
    sentimentOverlap: asset.change_percent >= 0 ? "Pozitif momentum" : asset.change_percent < 0 ? "Negatif momentum" : "Nötr",
    capitalRotationHint:
      peers.length > 0
        ? `Aynı kategoride ${peers[0]!.symbol} en hareketli eş.`
        : "Kategori eşleri sınırlı",
  };
}

function sessionForCategory(category: MarketAssetView["category"]): AssetIntelligenceBundle["session"] {
  switch (category) {
    case "crypto":
      return { headline: "Kripto 7/24", detail: "Global likidite ve haber akışı sürekli fiyatlanıyor." };
    case "forex":
      return { headline: "FX seansları", detail: "Makro veri ve kur koridoru baskın tema." };
    case "stocks":
      return { headline: "Hisse seansı", detail: "Şirket ve endeks akışı bölgesel saatlere bağlı." };
    case "commodity":
      return { headline: "Emtia masası", detail: "Arz/talep ve dolar endeksi korelasyonu izleniyor." };
    default:
      return { headline: "Piyasa oturumu", detail: "Canlı kotasyon ve sinyal akışı birleşik görünüm." };
  }
}

/** Live asset + signals + news → zengin AssetIntelligenceBundle (mock import yok). */
export function buildAssetIntelligenceFromLive(input: BuildAssetIntelInput): AssetIntelligenceBundle {
  const { symbol, asset: rawAsset, allAssets, signals, newsRows } = input;
  const symRows = signalRowsForSymbol(signals, symbol);
  const asset = enrichAssetWithSignals(rawAsset, symRows);
  const base = emptyAssetIntelligenceBundle(symbol);
  const summary = signalSummary(symRows);
  const active = symRows.filter((r) => r.is_active);
  const copies24h = symRows.reduce((s, r) => s + r.community_copies_24h + r.subscriber_copies_24h, 0);

  return {
    ...base,
    asset,
    categoryLabel: marketAssetCategoryLabelTr(asset.category),
    session: sessionForCategory(asset.category),
    heroIntel: buildHeroIntel(asset, symRows),
    signalSummary: summary,
    signalHub: {
      lifecycleCounts: {
        active: active.length,
        maturing: symRows.filter((r) => r.is_active && r.confidence >= 50 && r.confidence < 70).length,
        archived: symRows.filter((r) => !r.is_active).length,
      },
      premiumVisibleCount: active.filter((r) => r.signal_access !== "public").length,
      publicCount: active.filter((r) => r.signal_access === "public").length,
      copies24hTotal: copies24h,
      subscriberCopies24h: symRows.reduce((s, r) => s + r.subscriber_copies_24h, 0),
      discussionIntensity: Math.min(100, Math.round(symRows.reduce((s, r) => s + r.likes_count, 0) / 10)),
      debateThreads: symRows.filter((r) => r.discussion_active).length,
      creatorConcentrationPct:
        active.length > 0
          ? Math.round((new Set(active.map((r) => r.analyst.id)).size / active.length) * 100)
          : 0,
      thesisVarianceLabel: summary.bullSharePct >= 60 ? "Boğa ağırlıklı" : summary.bullSharePct <= 40 ? "Ayı ağırlıklı" : "Dengeli",
    },
    confidenceBins: confidenceBins(symRows),
    topAnalysts: topAnalysts(symRows),
    signals: symRows.slice(0, 12),
    stats: buildStats(asset),
    news: buildNews(symbol, newsRows),
    discussionSystem: {
      trendingThesisTitle:
        active.length > 0
          ? symbol + " · " + (summary.bullSharePct >= 50 ? "alım" : "satım") + " tezi öne çıkıyor"
          : symbol + " için aktif tez bekleniyor",
      thesisThreads: [],
      timeline: active.slice(0, 3).map((r, i) => ({
        id: `tl-${r.id}`,
        at: r.created_at,
        label: `${r.direction} çağrısı`,
        detail: `${r.analyst.display} · %${r.confidence}`,
        href: `/signals?asset=${encodeURIComponent(symbol)}&signal=${encodeURIComponent(r.id)}`,
        kind: "signal" as const,
      })),
      crossAssetNarrative:
        active.length > 0
          ? `${active.length} aktif çağrı; ortalama güven %${summary.avgConfidenceActive}.`
          : "Bu sembolde henüz aktif sinyal yok.",
      debateBullPct: summary.bullSharePct,
      debateBearPct: 100 - summary.bullSharePct,
      macroInterpretation: asset.change_percent >= 0 ? "Kısa vadeli momentum pozitif" : "Kısa vadeli baskı",
    },
    relatedCreators: relatedCreators(symRows),
    relatedNetwork: relatedNetwork(asset, allAssets),
    communitySurface: {
      ...base.communitySurface,
      activeDiscussions: symRows.filter((r) => r.discussion_active).length,
      bullCommunityPct: summary.bullSharePct,
      bearCommunityPct: 100 - summary.bullSharePct,
      relatedThreadHint:
        active.length > 0 ? "Sinyal detayında tartışma bağlantıları" : "Aktif çağrı yok",
    },
    userContextHints: {
      ...base.userContextHints,
      portfolioRelevance: active.length > 0 ? "Portföy kesişimi sinyaller sekmesinde" : "—",
    },
    symbolConsensus: buildSymbolConsensusIntel([...signals], symbol),
    marketSignalIntel: buildMarketSignalIntelligence([...symRows]),
  };
}

/** Tüm varlıkları sinyal feed'i ile zenginleştir (home rail, markets). */
export function enrichAllAssetsWithSignals(
  assets: readonly MarketAssetView[],
  signals: readonly SignalsFeedRow[],
): MarketAssetView[] {
  const bySymbol = new Map<string, SignalsFeedRow[]>();
  for (const row of signals) {
    const key = symKey(row.symbol);
    const bucket = bySymbol.get(key) ?? [];
    bucket.push(row);
    bySymbol.set(key, bucket);
  }
  return assets.map((asset) =>
    enrichAssetWithSignals(asset, bySymbol.get(symKey(asset.symbol)) ?? []),
  );
}

/** Sembol için live asset bul ve bundle üret; asset yoksa null. */
export function tryBuildAssetIntelligenceFromLive(
  symbol: string,
  allAssets: readonly MarketAssetView[],
  signals: readonly SignalsFeedRow[],
  newsRows: readonly MarketNewsDbRow[],
): AssetIntelligenceBundle | null {
  const asset = findAsset(allAssets, symbol);
  if (!asset || asset.price <= 0) return null;
  return buildAssetIntelligenceFromLive({ symbol, asset, allAssets, signals, newsRows });
}
