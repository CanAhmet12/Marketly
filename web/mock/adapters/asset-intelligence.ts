import type { MarketAssetCategory, MarketAssetView } from "@/features/markets/types";
import type {
  AssetChartWorkbenchModel,
  AssetCommunitySurface,
  AssetCreatorNetwork,
  AssetCreatorRanked,
  AssetDiscussionItem,
  AssetDiscussionSystem,
  AssetDiscussionTimelineEntry,
  AssetHeroIntel,
  AssetIntelligenceBundle,
  AssetMarketMemory,
  AssetMarketNewsItem,
  AssetMediaItem,
  AssetRelatedCreator,
  AssetRelatedNetwork,
  AssetSignalConfidenceBins,
  AssetSignalHubDetail,
  AssetSignalSummary,
  AssetStatRow,
  AssetThesisThreadRow,
  AssetTopAnalyst,
  AssetUserContextHints,
} from "@/features/markets/types/asset-intelligence";
import { marketAssetCategoryLabelTr } from "@/features/markets/types/asset-intelligence";
import { inferMarketAssetCategory } from "@/lib/market-category";
import type { AnalystLeaderboardRow, MarketSignalIntelligence, SymbolConsensusIntel } from "@/features/signals/intelligence/types";
import type { AssetSignalCommunityPulse } from "@/features/signals/community/types";
import { getMockAssetBySymbol, mockMarketDetailExtras } from "@/mock/adapters/markets-dashboard";
import { getMockSignalsFeedRows } from "@/mock/adapters/signals-dashboard";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { getMockMarketNews } from "@/mock/adapters/markets-workspace";
import { buildMockAssetSignalCommunityPulse } from "@/mock/adapters/signal-thread-pack";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";
import { MOCK_PROFILE_BY_ID, MOCK_PROFILES } from "@/mock/fixtures/profiles";
import { getSignalsRepository } from "@/features/signals/repository";

function symKey(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function sessionForSymbol(symbol: string): AssetIntelligenceBundle["session"] {
  const h = hashStr(symbol) % 3;
  if (h === 0) {
    return {
      headline: "US cash açık · Asya seansı",
      detail: "Likidite derin; haber öncesi volatilite genişleyebilir.",
    };
  }
  if (h === 1) {
    return {
      headline: "BIST seansı aktif · Kripto 7/24",
      detail: "Yerel akış + global risk iştahı birlikte fiyatlanıyor.",
    };
  }
  return {
    headline: "Avrupa örgütü · ABD öncesi",
    detail: "Makro veri penceresi yakın; koridor daralıyor.",
  };
}

function confidenceBins(rows: SignalsFeedRow[]): AssetSignalConfidenceBins {
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

function signalSummary(rows: SignalsFeedRow[]): AssetSignalSummary {
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
  const out: AssetTopAnalyst[] = [...m.entries()].map(([analystId, v]) => {
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
  });
  return out.sort((a, b) => b.activeCount - a.activeCount || b.avgConfidence - a.avgConfidence).slice(0, 4);
}

function buildNews(symbol: string): AssetMarketNewsItem[] {
  const u = symKey(symbol);
  const base = getMockMarketNews()
    .filter((n) => symKey(n.symbol) === u)
    .map((n, i): AssetMarketNewsItem => ({
      id: n.id,
      headline: n.headline,
      source: n.source,
      minutesAgo: n.minutesAgo,
      impact: ((i % 3) + 1) as 1 | 2 | 3,
      category: (["macro", "flows", "technical"] as const)[i % 3],
      sentiment: (["positive", "neutral", "mixed"] as const)[i % 3],
    }));
  const cats: AssetMarketNewsItem["category"][] = ["macro", "earnings", "policy", "flows", "technical"];
  const sent: AssetMarketNewsItem["sentiment"][] = ["positive", "negative", "neutral", "mixed"];
  const synth: AssetMarketNewsItem[] = [];
  let i = 0;
  while (base.length + synth.length < 5) {
    const h = hashStr(`${u}-nw-${i}`);
    synth.push({
      id: `nw-synth-${u}-${i}`,
      headline: `${u} için akış notu ${i + 1}: seviye + hacim teyidi`,
      source: "DeskWire",
      minutesAgo: 18 + (h % 200),
      impact: ((h % 3) + 1) as 1 | 2 | 3,
      category: cats[h % cats.length]!,
      sentiment: sent[h % sent.length]!,
    });
    i++;
  }
  return [...base, ...synth].slice(0, 6);
}

function buildDiscussions(symbol: string): AssetDiscussionItem[] {
  const u = symKey(symbol);
  const posts = MOCK_POST_SOURCES.filter((p) => {
    if (p.type !== "post") return false;
    const tag = p.asset_tag ? symKey(p.asset_tag) : "";
    const inTag = tag === u;
    const inText = p.content.toUpperCase().includes(u) || (p.title ?? "").toUpperCase().includes(u);
    return inTag || inText;
  });
  const picked = (() => {
    const seen = new Set<string>();
    const merged: typeof posts = [];
    for (const p of posts) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      merged.push(p);
    }
    if (merged.length < 4) {
      for (const p of MOCK_POST_SOURCES.filter((item) => item.type === "post")) {
        if (merged.length >= 6) break;
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        merged.push(p);
      }
    }
    return merged.slice(0, 6);
  })();
  return picked.map((p) => {
    const prof = MOCK_PROFILE_BY_ID[p.user_id];
    const h = hashStr(`${u}-d-${p.id}`);
    const sentiment: AssetDiscussionItem["sentiment"] = (["bullish", "bearish", "neutral"] as const)[h % 3];
    const kinds: AssetDiscussionItem["kind"][] = [
      "thesis",
      "update",
      "debate",
      "macro",
      "signal_followup",
      "quote",
      "cross_asset",
    ];
    const kind = kinds[h % kinds.length]!;
    return {
      id: p.id,
      creatorId: p.user_id,
      creatorDisplay: prof?.full_name ?? prof?.username ?? "Creator",
      creatorUsername: prof?.username ?? "creator",
      avatarUrl: prof?.avatar_url ?? null,
      verified: Boolean(prof?.verified),
      content: (p.title ? `${p.title} — ` : "") + p.content.slice(0, 220) + (p.content.length > 220 ? "…" : ""),
      sentiment,
      likes: p.likes,
      replies: p.comments,
      tags: [u, prof?.tier ?? "pro"].filter(Boolean),
      createdAt: p.created_at,
      href: `/post/${p.id}`,
      kind,
      threadTitle:
        kind === "thesis"
          ? `${u} · kırılım tezi`
          : kind === "debate"
            ? `${u} · iki senaryo`
            : kind === "macro"
              ? `${u} · makro okuma`
              : null,
      live: h % 4 === 0,
      creatorReplied: h % 5 === 0,
      convictionReactions: 2 + (h % 18),
      thesisFollowers: 10 + (h % 120),
      trackingCount: 20 + (h % 400),
    };
  });
}

function buildMedia(symbol: string): AssetMediaItem[] {
  const u = symKey(symbol);
  const pool = MOCK_POST_SOURCES.filter((p) => {
    if (!p.type || !["video", "short", "live"].includes(p.type)) return false;
    const tag = p.asset_tag ? symKey(p.asset_tag) : "";
    return tag === u;
  });
  const fallback = MOCK_POST_SOURCES.filter((p) => ["video", "short", "live"].includes(p.type ?? ""));
  const merged = (pool.length >= 3 ? pool : [...pool, ...fallback]).slice(0, 6);
  return merged.map((p, i) => {
    const prof = MOCK_PROFILE_BY_ID[p.user_id];
    const kind = (p.type === "short" ? "short" : p.type === "live" ? "live" : "video") as AssetMediaItem["kind"];
    const dur =
      p.duration != null
        ? `${Math.floor(p.duration / 60)}:${String(p.duration % 60).padStart(2, "0")}`
        : kind === "live"
          ? "CANLI"
          : null;
    const views = p.views_count;
    const viewsLabel = views >= 1_000_000 ? `${(views / 1_000_000).toFixed(1)}M izlenme` : views >= 1000 ? `${(views / 1000).toFixed(1)}K izlenme` : `${views} izlenme`;
    const intents = ["Makro özet", "Pulse kesiti", "Üretici yorum", "Seans recap", "Derinlemesine", "Canlı tartışma"];
    return {
      id: p.id,
      title: p.title ?? `${u} · ${kind === "short" ? "Short" : kind === "live" ? "Canlı" : "Analiz"}`,
      kind,
      durationLabel: dur,
      creatorDisplay: prof?.full_name ?? prof?.username ?? "Creator",
      thumbnailUrl: p.thumbnail_url,
      viewsLabel,
      href: kind === "live" ? `/live` : `/watch/${p.id}`,
      editorialIntent: intents[i % intents.length],
    };
  });
}

function relatedCreators(rows: SignalsFeedRow[], symbol: string): AssetRelatedCreator[] {
  const sk = symKey(symbol);
  const rot = hashStr(sk) % 4;
  const ids = new Set<string>();
  for (const r of rows) ids.add(r.analyst.id);
  const fromSignals = [...ids]
    .map((id) => {
      const prof = MOCK_PROFILE_BY_ID[id];
      if (!prof) return null;
      return {
        id: prof.id,
        display: prof.full_name ?? prof.username,
        username: prof.username,
        avatarUrl: prof.avatar_url,
        verified: prof.verified,
        role: "Sinyal & akış",
        href: `/channel/${prof.id}`,
      } satisfies AssetRelatedCreator;
    })
    .filter(Boolean) as AssetRelatedCreator[];

  const extra = MOCK_PROFILES.filter((p) => !ids.has(p.id))
    .slice(0, Math.max(0, 4 - fromSignals.length))
    .map(
      (prof): AssetRelatedCreator => ({
        id: prof.id,
        display: prof.full_name ?? prof.username,
        username: prof.username,
        avatarUrl: prof.avatar_url,
        verified: prof.verified,
        role: "Makro & sektör",
        href: `/channel/${prof.id}`,
      }),
    );

  const merged = [...fromSignals, ...extra];
  const rotated = [...merged.slice(rot), ...merged.slice(0, rot)];
  return rotated.slice(0, 4);
}

function statRows(category: MarketAssetCategory, asset: MarketAssetView, x: ReturnType<typeof mockMarketDetailExtras>): AssetStatRow[] {
  const h = hashStr(asset.symbol);
  const vol = asset.volume;
  const common: AssetStatRow[] = [
    { key: "mcap", label: "Piyasa değeri", value: asset.marketCapLabel },
    { key: "vol", label: "Hacim (24s)", value: vol },
    { key: "chg", label: "Günlük %", value: `${asset.change_percent >= 0 ? "+" : ""}${asset.change_percent.toFixed(2)}%` },
    { key: "sent", label: "Desk hissiyat", value: x.sentimentLabel, hint: "Model + fiyat aksiyonu (mock)" },
    { key: "sup", label: "Destek", value: x.support.toLocaleString("tr-TR") },
    { key: "res", label: "Direnç", value: x.resistance.toLocaleString("tr-TR") },
  ];

  if (category === "crypto") {
    return [
      ...common,
      { key: "dom", label: "BTC hakimiyet etkisi", value: `${(48 + (h % 12)).toFixed(1)}%`, hint: "Korelasyon mock" },
      { key: "ath", label: "ATH mesafe", value: `${-6 - (h % 18)}%`, hint: "Tarihsel zirre göre" },
      { key: "oi", label: "Açık pozisyon (mock)", value: `${(1.2 + (h % 50) / 10).toFixed(1)}B USD` },
      { key: "fund", label: "Funding 8s", value: `${((h % 17) - 8) / 1000 >= 0 ? "+" : ""}${(((h % 17) - 8) / 1000).toFixed(3)}%` },
    ];
  }
  if (category === "stocks") {
    return [
      ...common,
      { key: "pe", label: "F/K (TTM)", value: `${12 + (h % 18)}.${h % 9}`, hint: "Mock çarpan" },
      { key: "beta", label: "Beta (60g)", value: `${(0.85 + (h % 40) / 100).toFixed(2)}` },
      { key: "sec", label: "Sektör", value: (["Finans", "Savunma", "Teknoloji", "Enerji"] as const)[h % 4] },
      { key: "iv", label: "Impl. vol", value: `${22 + (h % 15)}%` },
    ];
  }
  if (category === "forex") {
    return [
      ...common,
      { key: "range", label: "Gün içi koridor", value: `${(0.12 + (h % 20) / 100).toFixed(2)}%` },
      { key: "pos", label: "Konumlanma (COT mock)", value: (["Nötr", "Uzun USD", "Kısa USD"] as const)[h % 3] },
      { key: "carry", label: "Carry", value: `${((h % 7) - 3) / 10 >= 0 ? "+" : ""}${(((h % 7) - 3) / 10).toFixed(1)}% yıllık` },
    ];
  }
  if (category === "commodity") {
    return [
      ...common,
      { key: "inv", label: "Stok / arz", value: (["Sıkı", "Dengeli", "Bol"] as const)[h % 3] },
      { key: "curve", label: "Eğri (mock)", value: (["Backwardation", "Contango", "Flat"] as const)[h % 3] },
    ];
  }
  return [
    ...common,
    { key: "w", label: "Bileşen ağırlığı", value: `${10 + (h % 8)}%`, hint: "Endeks türevi (mock)" },
    { key: "corr", label: "ABD risk beta", value: `${(0.7 + (h % 25) / 100).toFixed(2)}` },
  ];
}

function chartModel(symbol: string): AssetChartWorkbenchModel {
  const u = symKey(symbol);
  const comps = ["BTC", "ETH", "NDX", "XU100", "USDTRY"].filter((s) => s !== u).slice(0, 4);
  return {
    timeframes: [
      { id: "1S", label: "1S" },
      { id: "4S", label: "4S" },
      { id: "1G", label: "1G" },
      { id: "1H", label: "1H" },
      { id: "1A", label: "1A" },
    ],
    comparisonCandidates: comps.map((s) => ({ symbol: s, label: s })),
  };
}

function mapLbRow(row: AnalystLeaderboardRow): AssetCreatorRanked {
  return {
    analystId: row.analystId,
    display: row.display,
    href: row.href,
    avatarUrl: row.avatarUrl,
    verified: row.verified,
    badge: row.badges[0] ?? "Analist",
    metric: `${row.primaryMetricLabel} ${row.primaryMetricValue}`,
  };
}

function pickLeaderboardSection(id: string, n: number): AssetCreatorRanked[] {
  const s = getSignalsRepository().getAnalystLeaderboardSections().find((x) => x.id === id);
  return (s?.rows ?? []).slice(0, n).map(mapLbRow);
}

function computeCreatorConcentrationPct(rows: SignalsFeedRow[]): number {
  const active = rows.filter((r) => r.is_active);
  if (!active.length) return 0;
  const m = new Map<string, number>();
  for (const r of active) m.set(r.analyst.id, (m.get(r.analyst.id) ?? 0) + 1);
  const vals = [...m.values()].sort((a, b) => b - a);
  const t3 = vals.slice(0, 3).reduce((a, b) => a + b, 0);
  return Math.round((t3 / active.length) * 100);
}

function buildCreatorTimeline(rows: SignalsFeedRow[]): AssetCreatorNetwork["timeline"] {
  return rows
    .filter((r) => !r.is_active && (r.result === "TP" || r.result === "SL"))
    .slice(0, 5)
    .map((r) => ({
      at: r.created_at,
      label: r.result === "TP" ? "Hedef gerçekleşti" : "Stop / kapanış",
      analystDisplay: r.analyst.display,
      href: `/channel/${r.analyst.id}`,
    }));
}

function buildCreatorNetwork(rows: SignalsFeedRow[], _symbol: string, tops: AssetTopAnalyst[]): AssetCreatorNetwork {
  void _symbol;
  const topOnAsset: AssetCreatorRanked[] = tops.map((a) => ({
    analystId: a.analystId,
    display: a.display,
    href: `/channel/${a.analystId}`,
    avatarUrl: a.avatarUrl,
    verified: a.verified,
    badge: "Bu varlıkta aktif",
    metric: `${a.activeCount} çağrı · %${a.avgConfidence}`,
  }));
  return {
    topOnAsset,
    rising: pickLeaderboardSection("rising_analysts", 3),
    institutionalStyle: pickLeaderboardSection("institutional_style", 2),
    macroSpecialists: pickLeaderboardSection("best_macro", 2),
    mostCopied: pickLeaderboardSection("most_copied", 2),
    concentrationTop3Pct: computeCreatorConcentrationPct(rows),
    timeline: buildCreatorTimeline(rows),
  };
}

function buildHeroIntel(
  asset: MarketAssetView,
  c: SymbolConsensusIntel,
  s: AssetSignalSummary,
  m: MarketSignalIntelligence,
  rows: SignalsFeedRow[],
): AssetHeroIntel {
  const consensusDirection: AssetHeroIntel["consensusDirection"] =
    c.bullishConcentrationPct > c.bearishConcentrationPct + 10
      ? "bullish"
      : c.bearishConcentrationPct > c.bullishConcentrationPct + 10
        ? "bearish"
        : "neutral";
  const move = Math.abs(asset.change_percent);
  const volatilityRegime: AssetHeroIntel["volatilityRegime"] = move < 0.55 ? "quiet" : move < 1.35 ? "normal" : "expanded";
  const volatilityLabel = volatilityRegime === "quiet" ? "Sıkı aralık" : volatilityRegime === "normal" ? "Ölçülü vol" : "Genişleyen vol";
  const trendAcceleration: AssetHeroIntel["trendAcceleration"] =
    asset.change_percent > 1.2 ? "heating" : asset.change_percent < -1.2 ? "heating" : move < 0.12 ? "cooling" : "steady";
  const act = rows.filter((r) => r.is_active);
  const prem = act.filter((r) => r.signal_access !== "public").length;
  const premiumAnalystPct = act.length ? Math.round((prem / act.length) * 100) : 0;
  return {
    sentimentPulse: `${m.momentumLabel} · ${asset.trend === "up" ? "Alıcı akış" : asset.trend === "down" ? "Satıcı baskı" : "Dengeli fiyatlama"}`,
    consensusDirection,
    volatilityRegime,
    volatilityLabel,
    momentumLabel: m.momentumLabel,
    trendAcceleration,
    watchlistActivityLabel: `${4 + (hashStr(asset.symbol) % 9)}K izlenme (mock)`,
    premiumAnalystPct,
    signalActivityLabel: `${s.activeTotal} açık çağrı`,
    activeAnalystsLabel: `${c.activeAnalysts} analist odağı`,
  };
}

function buildSignalHub(rows: SignalsFeedRow[]): AssetSignalHubDetail {
  const active = rows.filter((r) => r.is_active);
  const maturing = active.filter((r) => r.lifecycle_phase === "developing" || r.lifecycle_phase === "near_target").length;
  const archived = rows.filter((r) => !r.is_active).length;
  const premiumVisibleCount = active.filter((r) => r.signal_access !== "public").length;
  const publicCount = Math.max(0, active.length - premiumVisibleCount);
  const copies24hTotal = rows.reduce((a, r) => a + r.community_copies_24h, 0);
  const subscriberCopies24h = rows.reduce((a, r) => a + r.subscriber_copies_24h, 0);
  const discussionIntensity = Math.min(
    100,
    Math.round(rows.reduce((a, r) => a + (r.discussion_active ? 12 : 0) + Math.log1p(r.likes_count) * 0.9, 0)),
  );
  const debateThreads = rows.filter((r) => r.discussion_active).length;
  const creatorConcentrationPct = computeCreatorConcentrationPct(rows);
  const thesisVarianceLabel = rows.length > 4 ? "Çoklu tez katmanı" : "Dar tez bandı";
  return {
    lifecycleCounts: { active: active.length, maturing, archived },
    premiumVisibleCount,
    publicCount,
    copies24hTotal,
    subscriberCopies24h,
    discussionIntensity,
    debateThreads,
    creatorConcentrationPct,
    thesisVarianceLabel,
  };
}

function buildCommunitySurface(pulse: AssetSignalCommunityPulse, discussions: AssetDiscussionItem[], c: SymbolConsensusIntel): AssetCommunitySurface {
  const sp = pulse.sentimentParticipation;
  const tot = Math.max(1, sp.bull + sp.bear + sp.neutral);
  const notableQuotes = discussions.slice(0, 2).map((d) => ({
    quote: d.content.slice(0, 140) + (d.content.length > 140 ? "…" : ""),
    source: d.creatorDisplay,
    href: d.href,
  }));
  return {
    activeDiscussions: discussions.length,
    recentCreatorUpdates: Math.min(discussions.length, 3),
    debateIntensity: Math.min(100, pulse.activeThreadPosts * 6 + pulse.hotSignalsCount * 4),
    bullCommunityPct: Math.round((sp.bull / tot) * 100),
    bearCommunityPct: Math.round((sp.bear / tot) * 100),
    thesisDisagreements: c.conflictingThesisGroups,
    notableQuotes,
    relatedThreadHint: `${pulse.hotSignalsCount} sıcak çağrıda tartışma birikimi.`,
  };
}

function buildMarketMemory(rows: SignalsFeedRow[], discussions: AssetDiscussionItem[], sums: AssetSignalSummary): AssetMarketMemory {
  const wins = rows.filter((r) => r.result === "TP").length;
  const losses = rows.filter((r) => r.result === "SL").length;
  const neutral = rows.filter((r) => !r.is_active && r.result !== "TP" && r.result !== "SL").length;
  const pastConsensusShifts =
    rows.length > 0
      ? [
          { at: new Date(Date.now() - 86400000 * 5).toISOString(), from: "Nötr", to: "Alıcı" },
          { at: new Date(Date.now() - 86400000 * 21).toISOString(), from: "Alıcı", to: "Karışık" },
        ]
      : [];
  const timeline: AssetMarketMemory["timeline"] = sums.recentClosed.map((c) => ({
    id: `mem-${c.id}`,
    at: c.at,
    kind: "signal_outcome" as const,
    label: `${c.direction} · ${c.result}`,
    detail: c.analyst,
  }));
  if (rows.length) {
    timeline.push({
      id: "mem-vol",
      at: new Date().toISOString(),
      kind: "vol_spike",
      label: "Volatilite penceresi",
      detail: "Son üç seansta geniş bant (mock).",
    });
  }
  const notableDiscussions = discussions.slice(0, 3).map((d) => ({
    id: d.id,
    title: d.content.slice(0, 72) + (d.content.length > 72 ? "…" : ""),
    href: d.href,
  }));
  const volatilityEpisodes = [
    { periodLabel: "Son 30g", maxSwingPct: `${(2 + (hashStr(rows[0]?.symbol ?? "x") % 5)).toFixed(1)}%` },
    { periodLabel: "Önceki çeyrek", maxSwingPct: `${(4 + (hashStr(rows[0]?.symbol ?? "x") % 6)).toFixed(1)}%` },
  ];
  return {
    signalOutcomes: { wins, losses, neutral },
    pastConsensusShifts,
    archivedCallsCount: rows.filter((r) => !r.is_active).length,
    notableDiscussions,
    volatilityEpisodes,
    timeline,
  };
}

function buildRelatedNetwork(
  asset: MarketAssetView,
  chart: AssetChartWorkbenchModel,
  m: MarketSignalIntelligence,
  tops: AssetTopAnalyst[],
): AssetRelatedNetwork {
  const correlated = chart.comparisonCandidates.slice(0, 4).map((c) => ({
    symbol: c.symbol,
    correlationLabel: "Yüksek β (mock)",
    href: `/markets/${encodeURIComponent(c.symbol)}`,
  }));
  const themeClusters = [
    {
      label: asset.category === "crypto" ? "Dijital likidite" : "Sektör kovası",
      symbols: [asset.symbol, ...chart.comparisonCandidates.map((x) => x.symbol).slice(0, 3)],
    },
  ];
  const macroThemes =
    asset.category === "forex" || asset.category === "index"
      ? ["Fed yolu", "Reel getiri"]
      : asset.category === "crypto"
        ? ["ETF akışı", "L2 maliyet"]
        : ["Bilanço sezonu", "Kur koridoru"];
  const analystOverlap = tops.slice(0, 2).map((a) => ({
    display: a.display,
    sharedSymbols: "BTC · SOL",
    href: `/channel/${a.analystId}`,
  }));
  return {
    correlated,
    themeClusters,
    macroThemes,
    analystOverlap,
    sentimentOverlap: m.overlapPairsLabel,
    capitalRotationHint: m.themeAcceleration,
  };
}

function buildUserContextHints(symbol: string): AssetUserContextHints {
  const h = hashStr(symbol);
  return {
    watchlistRankLabel: `Toplulukta #${3 + (h % 18)} izlenme`,
    followedCreatorOverlap: 2 + (h % 4),
    signalsFromFollowed: 1 + (h % 3),
    portfolioRelevance: h % 2 === 0 ? "Portföy beta ile hizalı" : "Nötr ağırlık",
    pinBehaviorNote: "Sabitlenen varlıklar piyasalar listesinde üst sıraya çıkar.",
  };
}

function buildDiscussionSystem(
  symbol: string,
  discussions: AssetDiscussionItem[],
  rows: SignalsFeedRow[],
  consensus: SymbolConsensusIntel,
): AssetDiscussionSystem {
  const u = symKey(symbol);
  const thesisThreads: AssetThesisThreadRow[] = discussions.slice(0, 4).map((d, i) => ({
    id: `th-${d.id}`,
    title: d.threadTitle ?? `${u} · tez ${i + 1}`,
    stance:
      d.sentiment === "bullish" ? "bullish" : d.sentiment === "bearish" ? "bearish" : i % 3 === 0 ? "mixed" : "neutral",
    participantCount: 4 + (d.replies % 20) + (d.likes % 10),
    lastActivityAt: d.createdAt,
    intensity: 32 + (hashStr(d.id) % 60),
    href: d.href,
    trending: i === 0,
  }));
  const fromPosts: AssetDiscussionTimelineEntry[] = discussions.slice(0, 3).map((d, i) => ({
    id: `tl-${d.id}`,
    at: d.createdAt,
    label:
      d.kind === "macro"
        ? "Makro yorum"
        : d.kind === "debate"
          ? "Tez tartışması"
          : d.kind === "signal_followup"
            ? "Sinyal takip"
            : "Üretici güncellemesi",
    detail: d.content.slice(0, 96) + (d.content.length > 96 ? "…" : ""),
    href: d.href,
    kind: (["creator", "debate", "thesis"] as const)[i % 3]!,
  }));
  const fromSignals: AssetDiscussionTimelineEntry[] = rows.slice(0, 2).map((r) => ({
    id: `tl-sig-${r.id}`,
    at: r.created_at,
    label: "Sinyal takibi",
    detail: `${r.direction} · güven %${r.confidence}`,
    href: `/signals?asset=${encodeURIComponent(u)}`,
    kind: "signal" as const,
  }));
  const timeline = [...fromPosts, ...fromSignals].slice(0, 7);
  const rawBull = consensus.bullishConcentrationPct + consensus.bearishConcentrationPct > 0 ? consensus.bullishConcentrationPct : 50;
  const rawBear = consensus.bullishConcentrationPct + consensus.bearishConcentrationPct > 0 ? consensus.bearishConcentrationPct : 50;
  const denom = rawBull + rawBear || 1;
  const debateBullPct = Math.round((rawBull / denom) * 100);
  const debateBearPct = 100 - debateBullPct;
  return {
    trendingThesisTitle: `${u} · güçlü başlık: konsensus vs. spot`,
    thesisThreads,
    timeline,
    crossAssetNarrative: `${u} akışı BTC ve endeks beta ile eşzamanlı tartışılıyor (mock).`,
    debateBullPct,
    debateBearPct,
    macroInterpretation: "Politika faizi ve likidite eğrisi tartışmada baskın (mock).",
    premiumDiscussionHint: rows.some((r) => r.signal_access !== "public")
      ? "Premium çağrılar tartışmayı sıkılaştırıyor."
      : undefined,
  };
}

export function getMockAssetIntelligenceBundle(symbol: string): AssetIntelligenceBundle | null {
  const asset = getMockAssetBySymbol(symbol);
  if (!asset) return null;
  const rows = getMockSignalsFeedRows().filter((r) => symKey(r.symbol) === symKey(asset.symbol));
  const sortedSignals = [...rows].sort((a, b) => Number(b.is_active) - Number(a.is_active) || b.confidence - a.confidence);
  const x = mockMarketDetailExtras(asset.price, asset.change_percent);
  const cat = inferMarketAssetCategory(asset.symbol);
  const sums = signalSummary(sortedSignals);
  const bins = confidenceBins(sortedSignals);
  const tops = topAnalysts(sortedSignals);
  const discussions = buildDiscussions(asset.symbol);
  const news = buildNews(asset.symbol);
  const media = buildMedia(asset.symbol);
  const chart = chartModel(asset.symbol);
  const pulse = buildMockAssetSignalCommunityPulse(sortedSignals, asset.symbol);
  const sigRepo = getSignalsRepository();
  const consensus = sigRepo.getSymbolConsensusIntel(symKey(asset.symbol));
  const marketIntel = sigRepo.getMarketSignalIntelligence();
  const discussionSystem = buildDiscussionSystem(asset.symbol, discussions, sortedSignals, consensus);

  return {
    asset,
    categoryLabel: marketAssetCategoryLabelTr(cat),
    session: sessionForSymbol(asset.symbol),
    heroIntel: buildHeroIntel(asset, consensus, sums, marketIntel, sortedSignals),
    signalSummary: sums,
    signalHub: buildSignalHub(sortedSignals),
    confidenceBins: bins,
    topAnalysts: tops,
    signals: sortedSignals.slice(0, 12),
    stats: statRows(cat, asset, x),
    news,
    discussions,
    discussionSystem,
    media,
    relatedCreators: relatedCreators(sortedSignals, asset.symbol),
    chart,
    assetSignalCommunity: pulse,
    communitySurface: buildCommunitySurface(pulse, discussions, consensus),
    creatorNetwork: buildCreatorNetwork(sortedSignals, asset.symbol, tops),
    marketMemory: buildMarketMemory(sortedSignals, discussions, sums),
    relatedNetwork: buildRelatedNetwork(asset, chart, marketIntel, tops),
    userContextHints: buildUserContextHints(asset.symbol),
    symbolConsensus: consensus,
    marketSignalIntel: marketIntel,
  };
}
