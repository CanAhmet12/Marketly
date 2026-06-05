import type { SignalsFeedRow } from "@/features/signals/repository/types";

import type {
  AffinityContext,
  InterestChip,
  InterestIntelligenceSnapshot,
  PersonalizationEvent,
} from "./personalization-types";

const HALF_LIFE_D = 10;
const NOW = () => Date.now();

function decay(ageMs: number): number {
  const days = ageMs / 86_400_000;
  return Math.exp((-Math.LN2 * days) / HALF_LIFE_D);
}

function baseWeight(kind: PersonalizationEvent["kind"]): number {
  switch (kind) {
    case "signal_copy":
      return 3.2;
    case "watch_progress":
      return 2.6;
    case "engagement_comment":
      return 2.4;
    case "engagement_like":
      return 1.4;
    case "discussion_open":
      return 2.1;
    case "room_open":
      return 2.3;
    case "recommendation_click":
      return 2;
    case "search_query":
      return 1.8;
    case "creator_view":
    case "asset_view":
      return 1.5;
    case "content_view":
      return 1.1;
    default:
      return 1;
  }
}

function normSym(s: string | undefined): string | null {
  if (!s) return null;
  const u = s.trim().toUpperCase();
  return u.length ? u : null;
}

const MACRO_RE = /makro|fed|faiz|enflasyon|tcmb|politika|eurusd|dxy|tahvil|abd\s*veri/i;
const CRYPTO_RE = /btc|eth|kripto|usdt|bnb|sol/i;
const BIST_RE = /bist|xu100|thyao|garan|asels|viop|hisse/i;

function tokenizeQuery(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[\s,;#]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && t.length <= 32)
    .slice(0, 12);
}

function themeFromText(s: string): string | null {
  if (MACRO_RE.test(s)) return "macro";
  if (CRYPTO_RE.test(s)) return "crypto";
  if (BIST_RE.test(s)) return "bist";
  return null;
}

type Agg = Map<string, number>;

function bump(map: Agg, key: string | null | undefined, delta: number) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + delta);
}

function aggregate(events: readonly PersonalizationEvent[], now = NOW()) {
  const creators: Agg = new Map();
  const assets: Agg = new Map();
  const topics: Agg = new Map();
  const signals: Agg = new Map();
  const rooms: Agg = new Map();
  const discussions: Agg = new Map();
  const formats: Agg = new Map();
  let macroW = 0;
  let shortW = 0;

  for (const e of events) {
    const age = Math.max(0, now - e.ts);
    const w0 = baseWeight(e.kind) * decay(age) * (0.55 + 0.45 * Math.min(1, e.quality ?? 0.72));
    bump(creators, e.creatorId, w0);
    bump(assets, normSym(e.assetSymbol), w0);
    bump(signals, e.signalId, w0);
    bump(rooms, e.roomId, w0);
    bump(discussions, e.discussionId, w0);
    if (e.topicToken) bump(topics, e.topicToken.toLowerCase(), w0 * 1.1);
    if (e.contentFormat) bump(formats, e.contentFormat, w0);
    if (e.query) {
      for (const t of tokenizeQuery(e.query)) {
        bump(topics, t, w0 * 0.85);
        const th = themeFromText(t);
        if (th === "macro") macroW += w0 * 0.35;
        if (th === "crypto" || th === "bist") shortW += w0 * 0.25;
      }
    }
    const blob = `${e.assetSymbol ?? ""} ${e.topicToken ?? ""}`;
    const th2 = themeFromText(blob);
    if (th2 === "macro") macroW += w0 * 0.2;
    if (th2 === "crypto" || th2 === "bist") shortW += w0 * 0.15;
    if (e.kind === "watch_progress" && e.contentFormat === "video") shortW += w0 * 0.12;
  }

  return { creators, assets, topics, signals, rooms, discussions, formats, macroW, shortW };
}

function normalizeMap(m: Agg, cap = 100): Record<string, number> {
  let max = 0;
  for (const v of m.values()) max = Math.max(max, v);
  const scale = max > 0 ? cap / max : 1;
  const out: Record<string, number> = {};
  for (const [k, v] of m) {
    if (!k) continue;
    out[k] = Math.round(Math.min(cap, v * scale) * 10) / 10;
  }
  return out;
}

function diversityIndex(maps: Record<string, number>[]): number {
  const all = maps.flatMap((o) => Object.values(o)).filter((x) => x > 4);
  if (all.length < 2) return 0.35;
  const mean = all.reduce((a, b) => a + b, 0) / all.length;
  const var_ = all.reduce((s, x) => s + (x - mean) ** 2, 0) / all.length;
  const cv = mean > 0 ? Math.sqrt(var_) / mean : 0;
  return Math.max(0, Math.min(1, 1 - cv * 0.85));
}

export function buildAffinityContext(events: readonly PersonalizationEvent[], now = NOW()): AffinityContext {
  const { creators, assets, topics, signals, rooms, discussions, formats, macroW, shortW } = aggregate(events, now);
  const c = normalizeMap(creators);
  const a = normalizeMap(assets);
  const t = normalizeMap(topics, 100);
  const s = normalizeMap(signals);
  const r = normalizeMap(rooms);
  const d = normalizeMap(discussions);
  const f = normalizeMap(formats);
  const denom = macroW + shortW + 1e-6;
  const horizonBias = Math.max(-1, Math.min(1, (macroW - shortW) / denom));
  const eventCount = events.length;
  const confidence = Math.max(0, Math.min(1, Math.log1p(eventCount) / Math.log1p(48)));
  const diversity = diversityIndex([c, a, t, f]);

  return {
    creators: c,
    assets: a,
    topics: t,
    signals: s,
    rooms: r,
    discussions: d,
    formats: f,
    meta: { eventCount, confidence, diversity, horizonBias },
  };
}

function topEntries(rec: Readonly<Record<string, number>>, n: number): { key: string; score: number }[] {
  return Object.entries(rec)
    .map(([key, score]) => ({ key, score }))
    .sort((x, y) => y.score - x.score)
    .slice(0, n);
}

function chipFromCreator(id: string): InterestChip {
  return {
    id: `c-${id}`,
    label: `Üretici · ${id.slice(0, 8)}`,
    href: `/channel/${encodeURIComponent(id)}`,
    kind: "creator",
  };
}

function chipFromAsset(sym: string): InterestChip {
  return {
    id: `a-${sym}`,
    label: sym,
    href: `/markets/${encodeURIComponent(sym)}`,
    kind: "asset",
  };
}

function chipFromTopic(tok: string): InterestChip {
  return {
    id: `t-${tok}`,
    label: `#${tok}`,
    href: `/results?q=${encodeURIComponent(tok)}`,
    kind: "topic",
  };
}

function classifyAffinityKey(k: string): "asset" | "creator" | "topic" {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(k)) return "creator";
  if (/^[A-Z][A-Z0-9]{1,11}$/.test(k)) return "asset";
  return "topic";
}

function risingFading(events: readonly PersonalizationEvent[], now = NOW()) {
  const mid = now - 3.5 * 86_400_000;
  const recent = events.filter((e) => e.ts >= mid);
  const older = events.filter((e) => e.ts < mid);
  const sumKeys = (slice: PersonalizationEvent[]) => {
    const m: Agg = new Map();
    for (const e of slice) {
      const age = Math.max(0, now - e.ts);
      const w = baseWeight(e.kind) * decay(age);
      bump(m, normSym(e.assetSymbol), w);
      bump(m, e.creatorId, w * 0.9);
      if (e.topicToken) bump(m, e.topicToken.toLowerCase(), w * 0.75);
    }
    return m;
  };
  const r = sumKeys(recent);
  const o = sumKeys(older);
  const rising: { key: string; delta: number; kind: "asset" | "creator" | "topic" }[] = [];
  const fading: { key: string; delta: number; kind: "asset" | "creator" | "topic" }[] = [];
  const keys = new Set([...r.keys(), ...o.keys()]);
  for (const k of keys) {
    if (!k) continue;
    const rv = r.get(k) ?? 0;
    const ov = o.get(k) ?? 0;
    const d = rv - ov;
    const kind: "asset" | "creator" | "topic" = classifyAffinityKey(k);
    if (d > 0.35) rising.push({ key: k, delta: d, kind });
    if (ov > 0.45 && rv < ov * 0.55) fading.push({ key: k, delta: d, kind });
  }
  rising.sort((a, b) => b.delta - a.delta);
  fading.sort((a, b) => a.delta - b.delta);
  return { rising, fading };
}

export function buildInterestIntelligence(
  events: readonly PersonalizationEvent[],
  ctx: AffinityContext,
  now = NOW(),
): InterestIntelligenceSnapshot {
  const cold = ctx.meta.eventCount < 4;
  if (cold) {
    return {
      headline: "İlgi grafiği başlangıç aşamasında",
      subline: "Piyasalar, sinyaller ve tartışmalar arasında gezindiğinde profilin otomatik güçlenir.",
      strongest: [],
      rising: [],
      fading: [],
      marketThemes: [],
      confidenceLabel: "Düşük güven — veri toplanıyor",
      horizonLabel: "Nötr",
      formatSummary: "Henüz format tercihi yok",
      coldStart: true,
    };
  }

  const { rising: riseRaw, fading: fadeRaw } = risingFading(events, now);
  const crTop = topEntries(ctx.creators, 4);
  const asTop = topEntries(ctx.assets, 4);
  const tpTop = topEntries(ctx.topics, 5).filter((e) => e.key.length > 1);

  const strongest: InterestChip[] = [
    ...asTop.map((e) => chipFromAsset(e.key)),
    ...crTop.map((e) => chipFromCreator(e.key)),
    ...tpTop.slice(0, 3).map((e) => chipFromTopic(e.key)),
  ].slice(0, 8);

  const rising: InterestChip[] = riseRaw.slice(0, 5).map((x) => {
    if (x.kind === "asset") return chipFromAsset(x.key);
    if (x.kind === "topic") return chipFromTopic(x.key.replace(/^#/, ""));
    return chipFromCreator(x.key);
  });

  const fading: InterestChip[] = fadeRaw.slice(0, 4).map((x) => {
    if (x.kind === "asset") return chipFromAsset(x.key);
    if (x.kind === "topic") return chipFromTopic(x.key.replace(/^#/, ""));
    return chipFromCreator(x.key);
  });

  const macroScore = Math.round(50 + ctx.meta.horizonBias * 38);
  const cryptoHit = Object.keys(ctx.assets).some((s) => /^(BTC|ETH|SOL|BNB)/.test(s));
  const bistHit = Object.keys(ctx.assets).some((s) => s.length === 5 && !s.includes("USD"));

  const marketThemes = [
    { id: "m1", label: "Makro & politika", scoreLabel: `${macroScore}% uyum` },
    { id: "m2", label: "Kripto derinlik", scoreLabel: cryptoHit ? "Aktif" : "İzlemede" },
    { id: "m3", label: "BIST akışı", scoreLabel: bistHit ? "Güçlü" : "Nötr" },
  ];

  const confPct = Math.round(ctx.meta.confidence * 100);
  const confidenceLabel =
    confPct >= 72 ? "Yüksek güven — çoklu sinyal" : confPct >= 42 ? "Orta güven — örüntü oluşuyor" : "Erken güven — devam edin";

  const horizonLabel =
    ctx.meta.horizonBias > 0.22 ? "Makro ağırlıklı" : ctx.meta.horizonBias < -0.22 ? "Kısa vade / taktik ağırlıklı" : "Dengeli ufuk";

  const fmtTop = topEntries(ctx.formats, 3);
  const formatSummary =
    fmtTop.length === 0
      ? "Karma format"
      : fmtTop.map((e) => (e.key === "video" ? "Video" : e.key === "live" ? "Canlı" : e.key === "pulse" ? "Pulse" : e.key === "signal" ? "Sinyal" : "Akış")).join(" · ");

  return {
    headline: "İlgi alanların",
    subline: "Davranış belleği — öneriler ve sıralamalar bu grafiğe bağlanır.",
    strongest,
    rising,
    fading,
    marketThemes,
    confidenceLabel,
    horizonLabel,
    formatSummary,
    coldStart: false,
  };
}

/** Sinyal vitrin sıralamasına eklenecek küçük kişiselleştirme deltası */
export function personalizationDeltaForSignal(row: SignalsFeedRow, ctx: AffinityContext | null): number {
  if (!ctx || ctx.meta.eventCount < 2) return 0;
  const sym = row.symbol.trim().toUpperCase();
  const a = ctx.assets[sym] ?? 0;
  const c = ctx.creators[row.analyst.id] ?? 0;
  const s = ctx.signals[row.id] ?? 0;
  return a * 0.09 + c * 0.07 + s * 0.11;
}

export function personalizedTrendScore(row: SignalsFeedRow, baseScore: number, ctx: AffinityContext | null): number {
  return baseScore + personalizationDeltaForSignal(row, ctx);
}

/** Ana akış engagement skoruna ilgi grafiği çarpanı — çok hafif (düzen baskın). */
export function blendHomeEngagementScore(
  post: {
    user_id: string;
    asset_tag: string | null;
    likes: number;
    comments: number;
    created_at: string;
    video_url?: string | null;
    type?: string | null;
  },
  base: number,
  ctx: AffinityContext | null,
): number {
  if (!ctx || ctx.meta.eventCount < 3) return base;
  const cr = ctx.creators[post.user_id] ?? 0;
  const ast = post.asset_tag ? ctx.assets[post.asset_tag.toUpperCase()] ?? 0 : 0;
  const isVideo = Boolean(post.video_url) || post.type === "video";
  const fv = isVideo ? ctx.formats.video ?? 0 : ctx.formats.post ?? 0;
  const mult = 1 + cr * 0.0055 + ast * 0.0048 + fv * 0.0022;
  return base * mult;
}
