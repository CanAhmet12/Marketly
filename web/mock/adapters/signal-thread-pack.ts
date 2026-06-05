import { hashToUnit } from "@/features/signals/domain/signal-meta";
import type {
  AssetSignalCommunityPulse,
  SignalThreadEntry,
  SignalThreadPack,
  SignalThreadReactions,
} from "@/features/signals/community/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

function isoOffsetHours(base: string, hours: number): string {
  return new Date(new Date(base).getTime() + hours * 3_600_000).toISOString();
}

function kindLabel(kind: SignalThreadEntry["kind"]): string {
  const m: Record<SignalThreadEntry["kind"], string> = {
    creator_update: "Üretici güncellemesi",
    community_reply: "Topluluk",
    quote_reply: "Alıntı",
    thesis_refine: "Tez revizyonu",
    market_reaction: "Piyasa tepkisi",
    partial_tp: "Kısmi TP",
    macro_update: "Makro notu",
    follow_up_signal: "Takip çağrısı",
  };
  return m[kind];
}

export function threadEntryBadge(kind: SignalThreadEntry["kind"]): string {
  return kindLabel(kind);
}

/** Deterministik thread — `SignalsRepository.getSignalThreadPack` mock kaynağı */
export function buildMockSignalThreadPack(row: SignalsFeedRow): SignalThreadPack {
  const h = hashToUnit(`${row.id}-th`);
  const base = row.created_at;
  const sym = row.symbol.toUpperCase();

  const e1: SignalThreadEntry = {
    id: `${row.id}-e1`,
    kind: "creator_update",
    role: "creator",
    displayName: row.analyst.display,
    body: `${sym} kurulumu yayında; haber öncesi maruziyeti kontrollü tutalım.`,
    at: isoOffsetHours(base, 0.5 + h * 0.3),
  };
  const e2: SignalThreadEntry = {
    id: `${row.id}-e2`,
    kind: "community_reply",
    role: "member",
    displayName: "Kurumsal üye",
    body: "Stop mesafesi likiditeye göre dar mı kalıyor?",
    at: isoOffsetHours(base, 2 + h * 1.5),
    sentiment: "neutral",
  };
  const e3: SignalThreadEntry = {
    id: `${row.id}-e3`,
    kind: "quote_reply",
    role: "analyst",
    displayName: row.analyst.display,
    body: "Dar değil — ATR ile uyumlu; kısmi çıkış seviyelerini güncelledim.",
    quoteSnippet: "Stop mesafesi likiditeye göre dar mı…",
    at: isoOffsetHours(base, 3.2 + h),
    sentiment: "bullish",
  };
  const e4: SignalThreadEntry = {
    id: `${row.id}-e4`,
    kind: "market_reaction",
    role: "member",
    displayName: "Desk izleyici",
    body: `${sym} hacim profili önceki seansa göre üst bantta; teyit beklenir.`,
    at: isoOffsetHours(base, 5 + h * 2),
    sentiment: h > 0.55 ? "bearish" : "bullish",
  };
  const e5: SignalThreadEntry = {
    id: `${row.id}-e5`,
    kind: "thesis_refine",
    role: "creator",
    displayName: row.analyst.display,
    body: "Makro baskı artarsa hedef bandını iki kademe aşağı çekerim; duyururum.",
    at: isoOffsetHours(base, 8 + h * 3),
  };

  const entries = h > 0.72 ? [e1, e2, e3, e4, e5] : h > 0.38 ? [e1, e2, e3, e4] : [e1, e2, e3];

  const bullish = 12 + Math.floor(h * 28);
  const bearish = 4 + Math.floor((1 - h) * 16);
  const tracking = 40 + Math.floor(h * 55);
  const copied = row.copies_count > 0 ? Math.min(row.copies_count, 80 + Math.floor(h * 40)) : 20 + Math.floor(h * 30);
  const disagreed = 2 + Math.floor((1 - h) * 8);
  const reactions: SignalThreadReactions = { bullish, bearish, tracking, copied, disagreed };

  const total = bullish + bearish + 20;
  const sentimentSplit = {
    bullPct: Math.round((bullish / total) * 100),
    bearPct: Math.round((bearish / total) * 100),
    neutralPct: Math.max(0, 100 - Math.round((bullish / total) * 100) - Math.round((bearish / total) * 100)),
  };

  const replyCount = 6 + Math.floor(h * 22);
  const quoteCount = 1 + Math.floor(h * 3);
  const creatorEntries = entries.filter((e) => e.role === "creator");
  const lastCreatorUpdateAt = creatorEntries.length ? creatorEntries[creatorEntries.length - 1]!.at : null;
  const pinnedNote =
    h > 0.6 ? "Üretici notu: Volatilite genişlerse kısmi realizasyon önceliklidir." : h > 0.25 ? "Strateji güncellemesi: Haber takvimine dikkat." : null;

  return {
    signalId: row.id,
    entries,
    reactions,
    replyCount,
    quoteCount,
    sentimentSplit,
    lastCreatorUpdateAt,
    pinnedNote,
  };
}

export function buildMockAssetSignalCommunityPulse(rows: SignalsFeedRow[], symbol: string): AssetSignalCommunityPulse {
  const u = symbol.trim().toUpperCase();
  const mine = rows.filter((r) => r.symbol.trim().toUpperCase() === u);
  const h = hashToUnit(`${u}-com`);
  let posts = 0;
  let replies = 0;
  for (const r of mine) {
    const p = buildMockSignalThreadPack(r);
    posts += p.entries.length;
    replies += p.replyCount;
  }
  const bull = mine.filter((r) => r.sentiment_alignment === "bullish").length;
  const bear = mine.filter((r) => r.sentiment_alignment === "bearish").length;
  const neu = Math.max(0, mine.length - bull - bear);
  const activeBuy = mine.filter((r) => r.is_active && r.direction === "BUY").length;
  const activeSell = mine.filter((r) => r.is_active && r.direction === "SELL").length;
  const analystConsensus: AssetSignalCommunityPulse["analystConsensus"] =
    activeBuy > activeSell * 1.15 ? "bullish" : activeSell > activeBuy * 1.15 ? "bearish" : "mixed";
  const trendingSnippet =
    mine.length === 0
      ? "Bu sembolde henüz yoğun tartışma akışı yok."
      : `${mine.length} çağrı · ${posts} thread satırı · ${replies} yanıt · 24s hız ${8 + Math.floor(h * 18)}`;

  return {
    activeThreadPosts: posts,
    hotSignalsCount: mine.filter((r) => buildMockSignalThreadPack(r).replyCount > 12).length,
    replyVelocity24h: 8 + Math.floor(h * 18),
    sentimentParticipation: { bull: bull + 2, bear: bear + 1, neutral: neu + 3 },
    analystConsensus,
    trendingSnippet,
  };
}
