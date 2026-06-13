import { economicCalendarEventHref, formatEventTime, impactLabel } from "@/features/markets/lib/economic-calendar-shared";
import { marketNewsDetailHref } from "@/features/markets/lib/market-news-shared";
import type { EconomicCalendarRow } from "@/features/markets/repository/markets-repository";
import type {
  CryptoMacroEventItem,
  CryptoNewsMacroItem,
  CryptoNewsMacroPayload,
} from "@/features/markets/crypto/detail/lib/crypto-news-macro-types";
import type { AssetIntelligenceBundle, AssetMarketNewsItem } from "@/features/markets/types/asset-intelligence";

const CATEGORY_LABELS: Record<AssetMarketNewsItem["category"], string> = {
  macro: "Makro",
  earnings: "Bilanço",
  flows: "Akış",
  policy: "Politika",
  technical: "Teknik",
  other: "Diğer",
};

const SENTIMENT_LABELS: Record<AssetMarketNewsItem["sentiment"], string> = {
  positive: "Olumlu",
  negative: "Olumsuz",
  neutral: "Nötr",
  mixed: "Karışık",
};

const CRYPTO_MACRO_ANCHORS = new Set(["BTC", "ETH", "SOL", "BNB", "XRP"]);

function symKey(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function mapNewsItem(item: AssetMarketNewsItem): CryptoNewsMacroItem {
  return {
    id: item.id,
    href: marketNewsDetailHref(item.id),
    headline: item.headline,
    source: item.source,
    minutesAgo: item.minutesAgo,
    impact: item.impact,
    category: item.category,
    categoryLabel: CATEGORY_LABELS[item.category] ?? "Haber",
    sentiment: item.sentiment,
    sentimentLabel: SENTIMENT_LABELS[item.sentiment] ?? "Nötr",
  };
}

function inferCalendarType(title: string): CryptoMacroEventItem["type"] {
  const t = title.toLowerCase();
  if (t.includes("unlock") || t.includes("kilit")) return "unlock";
  if (t.includes("etf")) return "etf";
  if (t.includes("fork")) return "fork";
  if (t.includes("list") || t.includes("listing") || t.includes("borsa")) return "listing";
  return "macro";
}

function isCalendarRelevant(row: EconomicCalendarRow, symbol: string): boolean {
  const key = symKey(symbol);
  const affected = (row.affectedSymbols ?? []).map(symKey);
  if (affected.includes(key)) return true;
  if (affected.some((s) => CRYPTO_MACRO_ANCHORS.has(s))) return true;

  const title = row.title.toLowerCase();
  if (title.includes("etf") || title.includes("bitcoin") || title.includes("kripto") || title.includes("crypto")) {
    return true;
  }
  if (
    key === "BTC" &&
    (title.includes("fed") || title.includes("faiz") || title.includes("cpi") || title.includes("enflasyon"))
  ) {
    return true;
  }
  return row.impact >= 2 && affected.length === 0;
}

function mapCalendarRow(row: EconomicCalendarRow, symbol: string): CryptoMacroEventItem {
  const key = symKey(symbol);
  const affected = (row.affectedSymbols ?? []).map(symKey);
  return {
    id: row.id,
    href: economicCalendarEventHref(row.id),
    title: row.title,
    dateLabel: formatEventTime(row.at),
    country: row.country,
    impact: row.impact,
    impactLabel: impactLabel(row.impact),
    type: inferCalendarType(row.title),
    volatilityHint: row.volatilityHint,
    affectsSymbol: affected.includes(key),
  };
}

export function buildCryptoNewsMacro(
  bundle: AssetIntelligenceBundle,
  calendarRows: readonly EconomicCalendarRow[],
): CryptoNewsMacroPayload {
  const symbol = bundle.asset.symbol;
  const mappedNews = bundle.news.map(mapNewsItem);
  const sortedNews = [...mappedNews].sort((a, b) => b.impact - a.impact || a.minutesAgo - b.minutesAgo);
  const featured = sortedNews.find((n) => n.impact >= 3) ?? sortedNews[0] ?? null;
  const restNews = sortedNews.filter((n) => n.id !== featured?.id).slice(0, 5);

  const now = Date.now();
  const events = calendarRows
    .filter((row) => isCalendarRelevant(row, symbol))
    .filter((row) => {
      const t = new Date(row.at).getTime();
      return !Number.isNaN(t) && t >= now - 6 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(0, 6)
    .map((row) => mapCalendarRow(row, symbol));

  const macroContext =
    bundle.session.detail ||
    `${symbol} için makro ve haber akışı — risk varlıkları ve likidite penceresi izleniyor.`;

  return {
    symbol,
    macroContext,
    macroThemes: bundle.relatedNetwork.macroThemes.slice(0, 4),
    featured,
    news: restNews,
    events,
  };
}
