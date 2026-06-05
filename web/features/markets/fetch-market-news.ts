import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MarketNewsIntelligenceItem,
  MarketNewsroomBundle,
} from "@/features/markets/types/news-calendar-intelligence";
import { emptyMarketNewsroomBundle } from "@/features/markets/types/news-calendar-intelligence";

export type MarketNewsDbRow = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  source: string;
  published_at: string;
  category: string | null;
  related_symbols: string[] | null;
  sentiment: string | null;
};

export type MarketNewsLiveItem = MarketNewsIntelligenceItem & {
  imageUrl: string | null;
  sourceUrl: string;
  summary: string | null;
};

function minutesSince(iso: string): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 60_000));
}

function inferCategory(row: MarketNewsDbRow): MarketNewsIntelligenceItem["newsCategory"] {
  const cat = (row.category ?? "").toLowerCase();
  const title = row.title.toLowerCase();
  const syms = (row.related_symbols ?? []).map((s) => s.toUpperCase());

  if (cat.includes("crypto") || syms.some((s) => ["BTC", "ETH", "SOL", "XRP"].includes(s))) return "crypto";
  if (cat.includes("earnings") || title.includes("earnings") || title.includes("bilanço")) return "earnings";
  if (cat.includes("flow") || title.includes("etf")) return "flows";
  if (syms.some((s) => ["USDTRY", "XU100", "TRY"].includes(s)) || title.includes("türkiye")) return "local";
  return "macro";
}

function inferImpact(row: MarketNewsDbRow): 1 | 2 | 3 {
  const s = (row.sentiment ?? "").toLowerCase();
  if (s === "positive" || s === "negative") return 3;
  const cat = inferCategory(row);
  if (cat === "crypto" || cat === "local") return 2;
  return 2;
}

function primarySymbol(row: MarketNewsDbRow): string {
  const syms = row.related_symbols ?? [];
  if (syms.length > 0) return syms[0]!.toUpperCase();
  return "MARKET";
}

function mapRowToIntel(
  row: MarketNewsDbRow,
  watched: readonly string[],
  portfolio: readonly string[],
): MarketNewsLiveItem {
  const aff = (row.related_symbols ?? []).map((s) => s.toUpperCase()).filter(Boolean);
  const sym = primarySymbol(row);
  const affected = aff.length > 0 ? aff : [sym];
  const watchSet = new Set(watched.map((s) => s.toUpperCase()));
  const portSet = new Set(portfolio.map((s) => s.toUpperCase()));

  return {
    id: row.id,
    symbol: sym,
    headline: row.title,
    source: row.source,
    minutesAgo: minutesSince(row.published_at),
    impactTier: inferImpact(row),
    affectedSymbols: affected,
    sectorImpact: "—",
    volatilityExpectation: "—",
    signalActivityLabel: "—",
    creatorCommentary: [],
    discussionSnippet: row.description?.trim() || "—",
    marketReaction: "—",
    momentumShift: "—",
    relatedMacroThemes: [],
    chainReactionHint: "—",
    historicalEcho: "—",
    hitsWatchlist: affected.some((s) => watchSet.has(s)),
    hitsPortfolio: affected.some((s) => portSet.has(s)),
    newsCategory: inferCategory(row),
    imageUrl: row.image_url,
    sourceUrl: row.url,
    summary: row.description,
  };
}

function buildCategoryCounts(items: readonly MarketNewsIntelligenceItem[]) {
  const counts = { all: items.length, macro: 0, earnings: 0, flows: 0, crypto: 0, local: 0 };
  for (const item of items) {
    counts[item.newsCategory] += 1;
  }
  return counts;
}

/** `market_news` tablosundan haber listesi */
export async function fetchMarketNewsRows(
  client: SupabaseClient,
  limit = 60,
): Promise<MarketNewsDbRow[]> {
  try {
    const { data, error } = await client
      .from("market_news")
      .select("id, title, description, url, image_url, source, published_at, category, related_symbols, sentiment")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.warn("[markets] fetchMarketNewsRows", error?.message);
      return [];
    }
    return data as MarketNewsDbRow[];
  } catch (e) {
    console.warn("[markets] fetchMarketNewsRows", e);
    return [];
  }
}

/** Tek haber — detay sayfası */
export async function fetchMarketNewsById(
  client: SupabaseClient,
  newsId: string,
): Promise<MarketNewsDbRow | null> {
  try {
    const { data, error } = await client
      .from("market_news")
      .select("id, title, description, url, image_url, source, published_at, category, related_symbols, sentiment")
      .eq("id", newsId)
      .maybeSingle();

    if (error || !data) return null;
    return data as MarketNewsDbRow;
  } catch {
    return null;
  }
}

export function buildMarketNewsroomBundle(
  rows: readonly MarketNewsDbRow[],
  watchedSymbols: readonly string[],
  portfolioSymbols: readonly string[],
): MarketNewsroomBundle {
  if (rows.length === 0) return emptyMarketNewsroomBundle();

  const items = rows.map((r) => mapRowToIntel(r, watchedSymbols, portfolioSymbols));
  const personalized = items.some((i) => i.hitsWatchlist || i.hitsPortfolio)
    ? "İzleme listen ve portföyünle kesişen haberler öne çıkarıldı"
    : "Güncel piyasa haberleri";

  return {
    items,
    personalizedHeadline: personalized,
    categoryCounts: buildCategoryCounts(items),
  };
}

export async function fetchMarketNewsroomBundle(
  client: SupabaseClient,
  watchedSymbols: readonly string[],
  portfolioSymbols: readonly string[],
): Promise<MarketNewsroomBundle> {
  const rows = await fetchMarketNewsRows(client);
  return buildMarketNewsroomBundle(rows, watchedSymbols, portfolioSymbols);
}
