import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MarketNewsIntelligenceItem,
  MarketNewsLiveFields,
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

export type MarketNewsLiveItem = MarketNewsIntelligenceItem & MarketNewsLiveFields;

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

function inferSectorImpact(category: MarketNewsIntelligenceItem["newsCategory"]): string {
  switch (category) {
    case "crypto":
      return "Kripto";
    case "local":
      return "Türkiye";
    case "earnings":
      return "Şirketler";
    case "flows":
      return "Emtia & sermaye akışı";
    case "macro":
      return "Makro";
    default:
      return "Piyasa";
  }
}

function inferHistoricalEcho(
  category: MarketNewsIntelligenceItem["newsCategory"],
  sentiment: string,
): string {
  const s = sentiment.toLowerCase();
  if (!s || s === "neutral") return "—";
  const positive = s.includes("positive") || s.includes("bullish");
  const negative = s.includes("negative") || s.includes("bearish");
  if (!positive && !negative) return "—";

  const echoes: Record<MarketNewsIntelligenceItem["newsCategory"], [string, string]> = {
    crypto: [
      "Benzer kripto başlıklarında: ilk saat yüksek volatilite",
      "Geçmiş örneklerde: haber sonrası kısa squeeze",
    ],
    local: [
      "Benzer yerel başlıklarda: kur kanalı genişlemesi",
      "Geçmiş seanslarda: endeks beta hızlı yansıdı",
    ],
    earnings: [
      "Benzer bilanço haberlerinde: sektör eşleri gecikmeli tepki",
      "Geçmiş örneklerde: sürpriz sonrası mean-reversion",
    ],
    flows: [
      "Benzer ETF akış haberlerinde: emtia korelasyonu güçlendi",
      "Geçmiş baskılarda: sermaye rotasyonu 24s içinde netleşti",
    ],
    macro: [
      "Benzer makro başlıklarda: tahvil eğrisi önce hareket etti",
      "Geçmiş örneklerde: risk varlıkları 60dk içinde yön buldu",
    ],
  };

  const pair = echoes[category];
  return positive ? pair[0] : pair[1];
}

function inferMacroThemes(
  category: MarketNewsIntelligenceItem["newsCategory"],
): readonly string[] {
  switch (category) {
    case "crypto":
      return ["Kripto regulasyonu", "Risk iştahı"];
    case "local":
      return ["Kur", "Yerel endeks"];
    case "earnings":
      return ["Kurumsal kazanç", "Sektör beta"];
    case "flows":
      return ["ETF akışları", "Emtia"];
    case "macro":
      return ["Para politikası", "Enflasyon"];
    default:
      return [];
  }
}

function enrichLiveIntelFields(
  row: MarketNewsDbRow,
  category: MarketNewsIntelligenceItem["newsCategory"],
  affected: readonly string[],
  watchSet: ReadonlySet<string>,
): Pick<
  MarketNewsIntelligenceItem,
  | "sectorImpact"
  | "volatilityExpectation"
  | "signalActivityLabel"
  | "marketReaction"
  | "momentumShift"
  | "relatedMacroThemes"
  | "chainReactionHint"
> {
  const sentiment = (row.sentiment ?? "").toLowerCase();
  const title = row.title.toLowerCase();
  const watchHit = affected.some((s) => watchSet.has(s));

  let marketReaction = "—";
  let momentumShift = "—";
  if (sentiment.includes("positive") || sentiment.includes("bullish")) {
    marketReaction = "Pozitif haber akışı — risk iştahı desteklenebilir";
    momentumShift = "Kısa vadeli momentum pozitif";
  } else if (sentiment.includes("negative") || sentiment.includes("bearish")) {
    marketReaction = "Negatif haber akışı — risk-off baskısı oluşabilir";
    momentumShift = "Kısa vadeli momentum negatif";
  } else if (sentiment.includes("neutral")) {
    marketReaction = "Nötr sentiment — sınırlı yön baskısı";
    momentumShift = "Momentum nötr";
  }

  const volatilityExpectation =
    category === "crypto" || title.includes("fed") || title.includes("faiz")
      ? "Yüksek"
      : category === "local"
        ? "Orta-yüksek"
        : "Orta";

  const signalActivityLabel = watchHit
    ? "İzleme listendeki semboller bu haberle kesişiyor"
    : affected.length > 2
      ? `${affected.length} sembol bu haberle ilişkilendirildi`
      : affected.length > 1
        ? "Çoklu sembol etkisi — korelasyon riski izlenmeli"
        : "—";

  const chainReactionHint =
    category === "crypto"
      ? "Kripto hareketi risk varlıklarına spillover potansiyeli"
      : category === "local"
        ? "Kur/endeks etkisi yerel beta üzerinden yayılabilir"
        : category === "macro"
          ? "Makro başlık tahvil–hisse korelasyonunu etkileyebilir"
          : category === "earnings"
            ? "Bilanço sürprizi sektör eşlerine yansıyabilir"
            : category === "flows"
              ? "Sermaye akışı benzer varlık sınıflarına taşınabilir"
              : "—";

  const relatedMacroThemes = inferMacroThemes(category);
  const sectorImpact = inferSectorImpact(category);

  return {
    sectorImpact,
    volatilityExpectation,
    signalActivityLabel,
    marketReaction,
    momentumShift,
    relatedMacroThemes,
    chainReactionHint: isIntelPlaceholder(chainReactionHint) ? "—" : chainReactionHint,
  };
}

function isIntelPlaceholder(value: string): boolean {
  const t = value.trim();
  return t.length === 0 || t === "—" || t === "-";
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
  const category = inferCategory(row);
  const enriched = enrichLiveIntelFields(row, category, affected, watchSet);

  return {
    id: row.id,
    symbol: sym,
    headline: row.title,
    source: row.source,
    minutesAgo: minutesSince(row.published_at),
    impactTier: inferImpact(row),
    affectedSymbols: affected,
    creatorCommentary: [],
    discussionSnippet: row.description?.trim() || "—",
    historicalEcho: inferHistoricalEcho(category, row.sentiment ?? ""),
    hitsWatchlist: affected.some((s) => watchSet.has(s)),
    hitsPortfolio: affected.some((s) => portSet.has(s)),
    newsCategory: category,
    imageUrl: row.image_url,
    sourceUrl: row.url,
    summary: row.description,
    publishedAt: row.published_at,
    sentimentLabel: row.sentiment?.trim() || null,
    ...enriched,
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
