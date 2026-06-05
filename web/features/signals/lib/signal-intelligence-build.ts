import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { signalCreatorQualityScore, signalMarketplaceTrendScore } from "@/features/signals/lib/signals-ranking";
import type {
  AnalystBadgeId,
  AnalystLeaderboardRow,
  AnalystLeaderboardSection,
  AnalystReputationProfile,
  AnalystReputationScores,
  MarketSignalIntelligence,
  SymbolConsensusIntel,
} from "@/features/signals/intelligence/types";

export type AnalystAgg = {
  analystId: string;
  display: string;
  avatarUrl: string | null;
  verified: boolean;
  followerCount: number;
  accuracy: number | null;
  rows: SignalsFeedRow[];
};

function hashUnit(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 1000) / 1000;
}

export function aggregateAnalystRows(rows: SignalsFeedRow[]): AnalystAgg[] {
  const m = new Map<string, AnalystAgg>();
  for (const r of rows) {
    const id = r.analyst.id;
    const cur = m.get(id);
    if (cur) {
      cur.rows.push(r);
    } else {
      m.set(id, {
        analystId: id,
        display: r.analyst.display,
        avatarUrl: r.analyst.avatar_url,
        verified: r.analyst.verified,
        followerCount: r.analyst.follower_count,
        accuracy: r.analyst.accuracy,
        rows: [r],
      });
    }
  }
  return [...m.values()];
}

function mean(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stdev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  return Math.sqrt(mean(nums.map((x) => (x - m) ** 2)));
}

function discussScore(rows: SignalsFeedRow[]): number {
  let s = 0;
  for (const r of rows) {
    if (r.discussion_active) s += 4;
    s += Math.log1p(r.likes_count) * 0.8 + Math.log1p(r.community_copies_24h) * 1.4 + (r.creator_replied_recently ? 2 : 0);
  }
  return s;
}

function rrAvg(rows: SignalsFeedRow[]): number {
  const xs = rows.map((r) => r.risk_reward_ratio).filter((x): x is number => x != null && Number.isFinite(x));
  return xs.length ? mean(xs) : 0;
}

function macroShare(rows: SignalsFeedRow[]): number {
  if (!rows.length) return 0;
  const n = rows.filter((r) => r.assetCategory === "forex" || r.assetCategory === "index").length;
  return n / rows.length;
}

function cryptoShare(rows: SignalsFeedRow[]): number {
  if (!rows.length) return 0;
  return rows.filter((r) => r.assetCategory === "crypto").length / rows.length;
}

function equityShare(rows: SignalsFeedRow[]): number {
  if (!rows.length) return 0;
  return rows.filter((r) => r.assetCategory === "stocks").length / rows.length;
}

function premiumShare(rows: SignalsFeedRow[]): number {
  if (!rows.length) return 0;
  return rows.filter((r) => r.signal_access !== "public").length / rows.length;
}

function deriveBadges(agg: AnalystAgg): AnalystBadgeId[] {
  const badges: AnalystBadgeId[] = [];
  const { rows } = agg;
  const m = macroShare(rows);
  const inst = agg.verified && m >= 0.35;
  if (inst) badges.push("institutional_style");
  if (m >= 0.45) badges.push("macro_specialist");
  if (rows.filter((r) => r.timeframe === "1S" || r.timeframe === "4S").length >= Math.ceil(rows.length * 0.35)) {
    badges.push("momentum_trader");
  }
  const discussRatio = rows.filter((r) => r.discussion_active || r.premium_discussion).length / Math.max(1, rows.length);
  if (discussRatio >= 0.35) badges.push("community_trusted");
  if (premiumShare(rows) >= 0.35) badges.push("premium_strategist");
  if (rows.length >= 8 && agg.followerCount >= 50_000) badges.push("veteran_analyst");
  const topRow = [...rows].sort((a, b) => b.confidence - a.confidence)[0]!;
  if (agg.followerCount < 95_000 && signalCreatorQualityScore(topRow) > 42) {
    badges.push("rising_creator");
  }
  return [...new Set(badges)].slice(0, 4);
}

function rowForAgg(agg: AnalystAgg): SignalsFeedRow {
  return agg.rows.reduce((best, r) => (signalCreatorQualityScore(r) > signalCreatorQualityScore(best) ? r : best), agg.rows[0]!);
}

function toLbRow(agg: AnalystAgg, rank: number, label: string, value: string, hint?: string): AnalystLeaderboardRow {
  return {
    rank,
    analystId: agg.analystId,
    display: agg.display,
    avatarUrl: agg.avatarUrl,
    verified: agg.verified,
    primaryMetricLabel: label,
    primaryMetricValue: value,
    secondaryHint: hint,
    badges: deriveBadges(agg),
    href: `/channel/${agg.analystId}`,
  };
}

export function buildAnalystReputationScores(agg: AnalystAgg): AnalystReputationScores {
  const acc = agg.accuracy ?? 52;
  const h = hashUnit(agg.analystId);
  const active = agg.rows.filter((r) => r.is_active).length;
  const avgConf = mean(agg.rows.map((r) => r.confidence));
  const copies = mean(agg.rows.map((r) => r.copies_count));
  const consist = Math.max(0, 100 - stdev(agg.rows.map((r) => r.confidence)) * 1.8);
  const longevity = Math.min(100, agg.rows.length * 6 + active * 4);
  const spec = Math.min(100, macroShare(agg.rows) * 55 + cryptoShare(agg.rows) * 50 + equityShare(agg.rows) * 45);
  const strat = mean(agg.rows.map((r) => (r.thesis_grade === "A" ? 90 : r.thesis_grade === "B" ? 72 : 55)));
  const rr = rrAvg(agg.rows);
  const riskAdj = Math.min(100, acc * 0.55 + rr * 14 + (agg.verified ? 8 : 0));
  const community = Math.min(100, discussScore(agg.rows) * 3.5 + (agg.rows.some((r) => r.creator_replied_recently) ? 12 : 0));
  const engagement = Math.min(100, Math.log1p(copies + 1) * 9 + Math.log1p(agg.followerCount + 1) * 2.2);
  const premium = Math.min(100, premiumShare(agg.rows) * 70 + (agg.rows.some((r) => r.signal_access === "subscriber_only") ? 15 : 0));
  const trust = Math.min(
    100,
    Math.round(acc * 0.42 + (agg.verified ? 14 : 0) + Math.min(22, Math.log1p(agg.followerCount) * 1.8) + avgConf * 0.22 + h * 6),
  );
  const conviction = Math.min(100, Math.round(avgConf * 0.85 + (active > 0 ? 10 : 0)));

  return {
    trustScore: Math.round(trust),
    consistencyScore: Math.round(consist),
    convictionQuality: Math.round(conviction),
    riskAdjustedPerformance: Math.round(riskAdj),
    communityTrust: Math.round(community),
    engagementQuality: Math.round(engagement),
    premiumReputation: Math.round(premium),
    signalLongevity: Math.round(longevity),
    specializationStrength: Math.round(spec),
    strategyQuality: Math.round(strat),
  };
}

export function buildAnalystReputationProfile(agg: AnalystAgg | undefined): AnalystReputationProfile | null {
  if (!agg || !agg.rows.length) return null;
  const scores = buildAnalystReputationScores(agg);
  const badges = deriveBadges(agg);
  const headline =
    scores.trustScore >= 78
      ? "Yüksek güven ağı — tutarlı çağrı üretimi"
      : scores.trustScore >= 62
        ? "Dengeli üretim — risk ayarlı görünüm"
        : "Gelişen üretici — örneklem genişledikçe skorlar sıkılaşır";
  return {
    analystId: agg.analystId,
    display: agg.display,
    headline,
    scores,
    badges,
  };
}

export function buildAnalystLeaderboardSections(rows: SignalsFeedRow[]): AnalystLeaderboardSection[] {
  const aggs = aggregateAnalystRows(rows);
  if (!aggs.length) return [];

  const cap = 8;
  const sections: AnalystLeaderboardSection[] = [];

  const top = [...aggs].sort((a, b) => signalCreatorQualityScore(rowForAgg(b)) - signalCreatorQualityScore(rowForAgg(a))).slice(0, cap);
  sections.push({
    id: "top_analysts",
    title: "Öne çıkan analistler",
    subtitle: "Kalite skoru · takipçi · isabet",
    rows: top.map((g, i) => toLbRow(g, i + 1, "Kalite", `${Math.round(signalCreatorQualityScore(rowForAgg(g)))}`, `${g.rows.length} çağrı`)),
  });

  const rising = [...aggs]
    .filter((g) => g.followerCount < 100_000)
    .sort((a, b) => signalMarketplaceTrendScore(rowForAgg(b)) - signalMarketplaceTrendScore(rowForAgg(a)))
    .slice(0, cap);
  if (rising.length) {
    sections.push({
      id: "rising_analysts",
      title: "Yükselen analistler",
      subtitle: "Momentum + daha küçük kitle",
      rows: rising.map((g, i) => toLbRow(g, i + 1, "Momentum", `${Math.round(signalMarketplaceTrendScore(rowForAgg(g)))}`, fmtFollowers(g.followerCount))),
    });
  }

  const accurate = [...aggs].sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0)).slice(0, cap);
  sections.push({
    id: "most_accurate",
    title: "En yüksek isabet",
    subtitle: "Geçmiş doğruluk (mock)",
    rows: accurate.map((g, i) => toLbRow(g, i + 1, "İsabet", `%${g.accuracy ?? "—"}`, `${g.rows.length} çağrı`)),
  });

  const rr = [...aggs].sort((a, b) => rrAvg(b.rows) - rrAvg(a.rows)).filter((g) => rrAvg(g.rows) > 0).slice(0, cap);
  if (rr.length) {
    sections.push({
      id: "highest_rr",
      title: "En yüksek R/R",
      subtitle: "Ortalama risk / ödül oranı",
      rows: rr.map((g, i) => toLbRow(g, i + 1, "Ort. R/R", `${rrAvg(g.rows).toFixed(2)}`, undefined)),
    });
  }

  const macro = [...aggs].filter((g) => macroShare(g.rows) >= 0.25).sort((a, b) => mean(b.rows.filter((r) => r.assetCategory === "forex" || r.assetCategory === "index").map((r) => r.confidence)) - mean(a.rows.filter((r) => r.assetCategory === "forex" || r.assetCategory === "index").map((r) => r.confidence))).slice(0, cap);
  if (macro.length) {
    sections.push({
      id: "best_macro",
      title: "Makro & FX gücü",
      subtitle: "Endeks / forex yoğunluğu",
      rows: macro.map((g, i) => toLbRow(g, i + 1, "Makro payı", `%${Math.round(macroShare(g.rows) * 100)}`, undefined)),
    });
  }

  const crypto = [...aggs].filter((g) => cryptoShare(g.rows) >= 0.2).sort((a, b) => cryptoShare(b.rows) - cryptoShare(a.rows)).slice(0, cap);
  if (crypto.length) {
    sections.push({
      id: "best_crypto",
      title: "Kripto uzmanları",
      subtitle: "Kripto çağrı konsantrasyonu",
      rows: crypto.map((g, i) => toLbRow(g, i + 1, "Kripto", `%${Math.round(cryptoShare(g.rows) * 100)}`, undefined)),
    });
  }

  const eq = [...aggs].filter((g) => equityShare(g.rows) >= 0.2).sort((a, b) => equityShare(b.rows) - equityShare(a.rows)).slice(0, cap);
  if (eq.length) {
    sections.push({
      id: "best_equity",
      title: "Hisse tarafı",
      subtitle: "BIST / hisse konsantrasyonu",
      rows: eq.map((g, i) => toLbRow(g, i + 1, "Hisse", `%${Math.round(equityShare(g.rows) * 100)}`, undefined)),
    });
  }

  const consistent = [...aggs]
    .filter((g) => g.rows.length >= 2)
    .sort((a, b) => stdev(a.rows.map((r) => r.confidence)) - stdev(b.rows.map((r) => r.confidence)))
    .slice(0, cap);
  if (consistent.length) {
    sections.push({
      id: "most_consistent",
      title: "En tutarlı güven",
      subtitle: "Düşük güven oynaklığı",
      rows: consistent.map((g, i) => toLbRow(g, i + 1, "σ güven", `${stdev(g.rows.map((r) => r.confidence)).toFixed(1)}`, undefined)),
    });
  }

  const copied = [...aggs].sort((a, b) => sumCopies(b.rows) - sumCopies(a.rows)).slice(0, cap);
  sections.push({
    id: "most_copied",
    title: "En çok kopyalanan",
    subtitle: "Topluluk katılımı",
    rows: copied.map((g, i) => toLbRow(g, i + 1, "Kopya", `${sumCopies(g.rows).toLocaleString("tr-TR")}`, undefined)),
  });

  const debated = [...aggs].sort((a, b) => discussScore(b.rows) - discussScore(a.rows)).slice(0, cap);
  sections.push({
    id: "most_discussed",
    title: "En çok tartışılan",
    subtitle: "Tartışma + etkileşim sinyali",
    rows: debated.map((g, i) => toLbRow(g, i + 1, "Tartışma skoru", `${Math.round(discussScore(g.rows))}`, undefined)),
  });

  const inst = [...aggs].filter((g) => g.verified && macroShare(g.rows) >= 0.2).sort((a, b) => signalCreatorQualityScore(rowForAgg(b)) - signalCreatorQualityScore(rowForAgg(a))).slice(0, cap);
  if (inst.length) {
    sections.push({
      id: "institutional_style",
      title: "Kurumsal üslup",
      subtitle: "Doğrulanmış + makro ağırlık",
      rows: inst.map((g, i) => toLbRow(g, i + 1, "Kalite", `${Math.round(signalCreatorQualityScore(rowForAgg(g)))}`, undefined)),
    });
  }

  const trusted = [...aggs]
    .filter((g) => g.rows.some((r) => r.premium_discussion || r.creator_replied_recently))
    .sort((a, b) => buildAnalystReputationScores(b).communityTrust - buildAnalystReputationScores(a).communityTrust)
    .slice(0, cap);
  if (trusted.length) {
    sections.push({
      id: "community_trusted",
      title: "Topluluk güveni",
      subtitle: "Üretici yanıtı · premium tartışma",
      rows: trusted.map((g, i) => toLbRow(g, i + 1, "Topluluk", `${buildAnalystReputationScores(g).communityTrust}`, undefined)),
    });
  }

  return sections.filter((s) => s.rows.length > 0);
}

function sumCopies(rs: SignalsFeedRow[]): number {
  return rs.reduce((s, r) => s + r.copies_count, 0);
}

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M takipçi`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K takipçi`;
  return `${n} takipçi`;
}

export function buildMarketSignalIntelligence(rows: SignalsFeedRow[]): MarketSignalIntelligence {
  if (!rows.length) {
    return {
      marketBias: "neutral",
      bullBearSplitPct: { bull: 50, bear: 50 },
      activeDebateAssetCount: 0,
      analystConcentrationTop: [],
      momentumLabel: "Veri yok",
      conflictingClusters: 0,
      themeAcceleration: "—",
      overlapPairsLabel: "—",
    };
  }
  const active = rows.filter((r) => r.is_active);
  const buys = active.filter((r) => r.direction === "BUY").length;
  const sells = active.filter((r) => r.direction === "SELL").length;
  const denom = Math.max(1, buys + sells);
  const bull = Math.round((buys / denom) * 100);
  const bear = Math.round((sells / denom) * 100);
  let marketBias: MarketSignalIntelligence["marketBias"] = "neutral";
  if (bull >= bear + 12) marketBias = "bullish";
  else if (bear >= bull + 12) marketBias = "bearish";

  const symMap = new Map<string, number>();
  for (const r of active) {
    const k = r.symbol.trim().toUpperCase();
    symMap.set(k, (symMap.get(k) ?? 0) + 1);
  }
  const totalA = active.length || 1;
  const analystConcentrationTop = [...symMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symbol, c]) => ({ symbol, sharePct: Math.round((c / totalA) * 100) }));

  const debateSyms = new Set(rows.filter((r) => r.discussion_active).map((r) => r.symbol.trim().toUpperCase()));
  const conflictingClusters = Math.max(0, Math.floor(rows.filter((r) => r.is_active && r.community_bias === "mixed").length / 3));

  const mom = mean(active.map((r) => signalMarketplaceTrendScore(r)));
  const momentumLabel = mom >= 48 ? "Momentum güçleniyor" : mom >= 38 ? "Dengeli akış" : "Seçici katılım";

  const h = hashUnit("theme");
  const themeAcceleration = h > 0.55 ? "Kripto + risk iştahı genişliyor (mock)" : h > 0.28 ? "Makro bekleyiş — volatilite seçici" : "Hisse tarafı göreli durgun";

  const overlapPairsLabel = buildOverlapLabel(rows);

  return {
    marketBias,
    bullBearSplitPct: { bull, bear: bear },
    activeDebateAssetCount: debateSyms.size,
    analystConcentrationTop,
    momentumLabel,
    conflictingClusters,
    themeAcceleration,
    overlapPairsLabel,
  };
}

function buildOverlapLabel(rows: SignalsFeedRow[]): string {
  const pair = new Map<string, number>();
  const bySym = new Map<string, Set<string>>();
  for (const r of rows.filter((x) => x.is_active)) {
    const s = r.symbol.trim().toUpperCase();
    if (!bySym.has(s)) bySym.set(s, new Set());
    bySym.get(s)!.add(r.analyst.id);
  }
  for (const [, ids] of bySym) {
    if (ids.size < 2) continue;
    const arr = [...ids].sort();
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const k = `${arr[i]}|${arr[j]}`;
        pair.set(k, (pair.get(k) ?? 0) + 1);
      }
    }
  }
  const top = [...pair.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) return "Çoklu analist örtüşmesi sınırlı";
  return `Örtüşen çağrılar: ${top[1]} aktif çift (mock ağı)`;
}

export function buildSymbolConsensusIntel(rows: SignalsFeedRow[], symbol: string): SymbolConsensusIntel {
  const u = symbol.trim().toUpperCase();
  const mine = rows.filter((r) => r.symbol.trim().toUpperCase() === u);
  if (!mine.length) {
    return {
      symbol: u,
      agreementPct: 0,
      confidenceAvg: 0,
      bullishConcentrationPct: 0,
      bearishConcentrationPct: 0,
      splitSentiment: false,
      strongestConviction: null,
      activeAnalysts: 0,
      conflictingThesisGroups: 0,
    };
  }
  const active = mine.filter((r) => r.is_active);
  const analysts = new Set(active.map((r) => r.analyst.id));
  const buys = active.filter((r) => r.direction === "BUY").length;
  const sells = active.filter((r) => r.direction === "SELL").length;
  const holds = active.filter((r) => r.direction === "HOLD").length;
  const t = Math.max(1, active.length);
  const maxDir = Math.max(buys, sells, holds);
  const agreementPct = Math.round((maxDir / t) * 100);
  const confidenceAvg = Math.round(mean(active.map((r) => r.confidence)));
  const bs = buys + sells || 1;
  const bullishConcentrationPct = Math.round((buys / bs) * 100);
  const bearishConcentrationPct = Math.round((sells / bs) * 100);
  const splitSentiment = agreementPct < 72 && active.length >= 2;
  const strongestConviction = active.length ? Math.max(...active.map((r) => r.confidence)) : null;
  const mixed = active.filter((r) => r.community_bias === "mixed").length;
  const conflictingThesisGroups = Math.min(active.length, 1 + Math.floor(mixed / 2));

  return {
    symbol: u,
    agreementPct,
    confidenceAvg,
    bullishConcentrationPct,
    bearishConcentrationPct,
    splitSentiment,
    strongestConviction,
    activeAnalysts: analysts.size,
    conflictingThesisGroups,
  };
}

export function findAgg(aggs: AnalystAgg[], analystId: string): AnalystAgg | undefined {
  return aggs.find((a) => a.analystId === analystId);
}
