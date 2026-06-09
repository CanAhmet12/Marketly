import type { InterestIntelligenceSnapshot } from "@/features/personalization/domain/personalization-types";
import type { MarketAssetView } from "@/features/markets/types";
import type { MarketNewsDbRow } from "@/features/markets/fetch-market-news";

import { getHomeRepository } from "@/features/home/repository";
import type { RecommendedCreatorCard } from "@/features/home/types";
import { isMockDataEnabled } from "@/mock/config";
import {
  EDITORIAL_MOCK_INTERESTS_FALLBACK,
  EDITORIAL_MOCK_TODAY,
  EDITORIAL_MOCK_TRENDING,
} from "@/mock/fixtures/editorial-rail-extras";

import { buildSparklineSeries } from "@/features/markets/lib/sparkline-series";
import { fmtPrice } from "@/features/markets/lib/live-category/live-category-shared";
import { marketSymbolPath } from "@/features/markets/markets-routes";

import { buildEditorialMarketStripItems } from "./build-market-strip-items";
import { railSymbolPriority } from "../visual/rail-design-tokens";
import type { HomeVisualRailLink } from "../visual/mock-data";

const RAIL_ITEMS_PER_CATEGORY = 4;

function strengthFromScoreLabel(scoreLabel?: string): "high" | "mid" | "low" {
  const s = (scoreLabel ?? "").toLowerCase();
  if (s.includes("güçl") || s.includes("yüksek") || s.includes("high")) return "high";
  if (s.includes("düşük") || s.includes("low") || s.includes("hafif")) return "low";
  return "mid";
}

export function buildInterestsFromIntel(intel: InterestIntelligenceSnapshot): HomeVisualRailLink[] {
  const rows: HomeVisualRailLink[] = [];
  for (const chip of intel.strongest.slice(0, 6)) {
    rows.push({
      label: chip.label,
      chipStrength: strengthFromScoreLabel(),
    });
  }
  if (rows.length === 0) {
    for (const th of intel.marketThemes.slice(0, 4)) {
      rows.push({
        label: th.label,
        meta: th.scoreLabel,
        chipStrength: strengthFromScoreLabel(th.scoreLabel),
      });
    }
  }
  return rows;
}

/** Kategori bazlı market preview için type */
export type CategoryPreview = {
  id: string;
  label: string;
  overallSign: "up" | "down" | "flat";
  items: HomeVisualRailLink[];
};

/** Sağ rail haber item */
export type RailNewsItem = {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  newsCategory: string;
  categoryLabel: string;
  relatedSymbol?: string;
  href: string;
  imageUrl?: string | null;
  sentiment?: string | null;
};

const NEWS_CAT_LABELS: Record<string, string> = {
  crypto: "Kripto",
  macro: "Makro",
  earnings: "Bilanço",
  flows: "Akışlar",
  local: "Yerel",
};

export type EditorialRailBundle = {
  shortcuts: HomeVisualRailLink[];
  today: HomeVisualRailLink[];
  interests: HomeVisualRailLink[];
  /** @deprecated discussions kaynağı — sinyaller için `signals` kullan */
  trending: HomeVisualRailLink[];
  signals: HomeVisualRailLink[];
  discussions: HomeVisualRailLink[];
  creators: HomeVisualRailLink[];
  categoryPreviews: CategoryPreview[];
  newsItems: RailNewsItem[];
};

function formatNewsTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}s`;
  return `${Math.floor(hours / 24)}g`;
}

function inferNewsCategory(row: MarketNewsDbRow): string {
  const cat = (row.category ?? "").toLowerCase();
  const title = row.title.toLowerCase();
  const syms = (row.related_symbols ?? []).map((s) => s.toUpperCase());
  if (cat.includes("crypto") || syms.some((s) => ["BTC", "ETH", "SOL", "XRP"].includes(s))) return "crypto";
  if (cat.includes("earnings") || title.includes("bilanço")) return "earnings";
  if (cat.includes("flow") || title.includes("etf")) return "flows";
  if (syms.some((s) => ["XU100", "TRY", "USDTRY"].includes(s)) || title.includes("türkiye")) return "local";
  return "macro";
}

function buildNewsItems(rows: MarketNewsDbRow[]): RailNewsItem[] {
  return rows.slice(0, 5).map((r) => {
    const newsCategory = inferNewsCategory(r);
    const relatedSymbol = r.related_symbols?.[0]?.toUpperCase();
    return {
      id: r.id,
      title: r.title,
      source: r.source,
      timeAgo: formatNewsTimeAgo(r.published_at),
      newsCategory,
      categoryLabel: NEWS_CAT_LABELS[newsCategory] ?? "Haber",
      relatedSymbol,
      href: `/market-news/${r.id}`,
      imageUrl: r.image_url,
      sentiment: r.sentiment,
    };
  });
}

/** Mock mode haber fallback — gerçek entegrasyon öncesi önizleme */
const MOCK_NEWS_FALLBACK: RailNewsItem[] = [
  {
    id: "mock-n1",
    title: "Fed üyeleri enflasyon görünümünde temkinli tonu sürdürdü",
    source: "Reuters",
    timeAgo: "12dk",
    newsCategory: "macro",
    categoryLabel: "Makro",
    relatedSymbol: "SPX",
    href: "/market-news",
    sentiment: "negative",
  },
  {
    id: "mock-n2",
    title: "Bitcoin ETF girişleri haftalık rekor seviyeye yaklaştı",
    source: "Bloomberg",
    timeAgo: "34dk",
    newsCategory: "crypto",
    categoryLabel: "Kripto",
    relatedSymbol: "BTC",
    href: "/market-news",
    sentiment: "positive",
  },
  {
    id: "mock-n3",
    title: "THYAO: yolcu trafiği verisi beklentinin üzerinde geldi",
    source: "KAP",
    timeAgo: "1s",
    newsCategory: "earnings",
    categoryLabel: "Bilanço",
    relatedSymbol: "THYAO",
    href: "/market-news",
  },
  {
    id: "mock-n4",
    title: "TCMB rezerv verisi: net döviz pozisyonu güçlendi",
    source: "Marketly",
    timeAgo: "2s",
    newsCategory: "local",
    categoryLabel: "Yerel",
    relatedSymbol: "USDTRY",
    href: "/market-news",
  },
  {
    id: "mock-n5",
    title: "Altın fiyatları jeopolitik risk primiyle yeni zirveyi test ediyor",
    source: "Bloomberg",
    timeAgo: "3s",
    newsCategory: "flows",
    categoryLabel: "Akışlar",
    relatedSymbol: "GOLD",
    href: "/market-news",
  },
];

/** asset_prices category field'ına göre piyasa kategorileri */
const CATEGORY_DEFS: Array<{ id: string; label: string; category: string }> = [
  { id: "crypto", label: "Kripto", category: "crypto" },
  { id: "stocks", label: "Hisse", category: "stocks" },
  { id: "forex", label: "Döviz", category: "forex" },
  { id: "commodity", label: "Emtia", category: "commodity" },
  { id: "index", label: "Endeks", category: "index" },
];

const MOCK_SYMBOL_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  BNB: "BNB",
  THYAO: "Türk Hava Yolları",
  GARAN: "Garanti BBVA",
  AKBNK: "Akbank",
  SISE: "Şişecam",
  USDTRY: "Dolar/TL",
  EURUSD: "Euro/Dolar",
  GBPUSD: "Sterlin/Dolar",
  EURTRY: "Euro/TL",
  GOLD: "Altın",
  OIL: "Ham petrol",
  SILVER: "Gümüş",
  BRENT: "Brent petrol",
  XU100: "BIST 100",
  SPX: "S&P 500",
  NDX: "Nasdaq 100",
  DJI: "Dow Jones",
};

function mockRailItem(
  symbol: string,
  changePct: number,
  price: number,
  extras?: Partial<HomeVisualRailLink>,
): HomeVisualRailLink {
  const sign = changePct > 0.04 ? "up" : changePct < -0.04 ? "down" : "neutral";
  const trend: "up" | "down" | "flat" = sign === "up" ? "up" : sign === "down" ? "down" : "flat";
  return {
    label: symbol,
    meta: formatPct(changePct),
    accent: sign === "neutral" ? undefined : sign,
    price: fmtPrice(price),
    href: marketSymbolPath(symbol),
    sparkline: buildSparklineSeries(symbol, trend, 16),
    sparkTrend: trend,
    assetName: MOCK_SYMBOL_NAMES[symbol],
    volumeLabel: extras?.volumeLabel,
    signalCount: extras?.signalCount,
    ...extras,
  };
}

/** Mock mode için örnek kategori preview'ları — gerçek veri yokken fallback */
const MOCK_CATEGORY_PREVIEWS: CategoryPreview[] = [
  {
    id: "crypto",
    label: "Kripto",
    overallSign: "up",
    items: [
      mockRailItem("BTC", 2.41, 98420, { volumeLabel: "42,1B", signalCount: 12 }),
      mockRailItem("ETH", 1.87, 3842, { volumeLabel: "18,4B", signalCount: 8 }),
      mockRailItem("SOL", -0.52, 142.5, { volumeLabel: "2,8B", signalCount: 5 }),
      mockRailItem("BNB", 0.94, 612.8, { volumeLabel: "1,2B", signalCount: 3 }),
    ],
  },
  {
    id: "stocks",
    label: "Hisse",
    overallSign: "flat",
    items: [
      mockRailItem("THYAO", 0.85, 312.4),
      mockRailItem("GARAN", -0.32, 98.2),
      mockRailItem("AKBNK", 0.42, 68.5),
      mockRailItem("SISE", 0.14, 54.8),
    ],
  },
  {
    id: "forex",
    label: "Döviz",
    overallSign: "down",
    items: [
      mockRailItem("USDTRY", 0.38, 34.12),
      mockRailItem("EURUSD", -0.12, 1.0842),
      mockRailItem("GBPUSD", 0.05, 1.2718),
      mockRailItem("EURTRY", 0.22, 36.84),
    ],
  },
  {
    id: "commodity",
    label: "Emtia",
    overallSign: "up",
    items: [
      mockRailItem("GOLD", 0.72, 2341),
      mockRailItem("OIL", 1.24, 78.4),
      mockRailItem("SILVER", -0.18, 28.6),
      mockRailItem("BRENT", 0.88, 82.1),
    ],
  },
  {
    id: "index",
    label: "Endeks",
    overallSign: "up",
    items: [
      mockRailItem("XU100", 0.41, 10124),
      mockRailItem("SPX", -0.18, 6010),
      mockRailItem("NDX", 0.62, 21480),
      mockRailItem("DJI", 0.24, 42850),
    ],
  },
];

/** Mock sinyal satırları — rail önizlemesi */
const MOCK_SIGNAL_ROWS: HomeVisualRailLink[] = [
  {
    label: "BTC",
    meta: "1G",
    href: "/signals",
    signalDirection: "BUY",
    confidence: 4,
    timeframe: "1G",
    sparkline: buildSparklineSeries("sig-btc", "up", 14),
    sparkTrend: "up",
    trendDelta: "+18%",
    trendDeltaAccent: "up",
    rank: 1,
    isHot: true,
    detail: "Giriş 97.420",
    assetName: "Ayşe Kaya",
  },
  {
    label: "THYAO",
    meta: "4S",
    href: "/signals",
    signalDirection: "BUY",
    confidence: 3,
    timeframe: "4S",
    sparkline: buildSparklineSeries("sig-thyao", "up", 14),
    sparkTrend: "up",
    trendDelta: "+9%",
    trendDeltaAccent: "up",
    rank: 2,
  },
  {
    label: "USDTRY",
    meta: "1G",
    href: "/signals",
    signalDirection: "SELL",
    confidence: 4,
    timeframe: "1G",
    sparkline: buildSparklineSeries("sig-usdtry", "down", 14),
    sparkTrend: "down",
    trendDelta: "+6%",
    trendDeltaAccent: "up",
    rank: 3,
  },
  {
    label: "NVDA",
    meta: "1H",
    href: "/signals",
    signalDirection: "HOLD",
    confidence: 3,
    timeframe: "1H",
    sparkline: buildSparklineSeries("sig-nvda", "flat", 14),
    sparkTrend: "flat",
    trendDelta: "−2%",
    trendDeltaAccent: "down",
    rank: 4,
    detail: "Giriş 892,40",
    assetName: "Kerem Yılmaz",
  },
  {
    label: "ETH",
    meta: "4S",
    href: "/signals",
    signalDirection: "BUY",
    confidence: 5,
    timeframe: "4S",
    sparkline: buildSparklineSeries("sig-eth", "up", 14),
    sparkTrend: "up",
    trendDelta: "+24%",
    trendDeltaAccent: "up",
    rank: 5,
    detail: "Giriş 3.842",
    assetName: "Ayşe Kaya",
    isHot: true,
  },
];

function formatPct(change: number): string {
  if (Math.abs(change) < 0.0001) return "0,00%";
  return `${change >= 0 ? "+" : ""}${change.toFixed(2).replace(".", ",")}%`;
}

/** Canlı mover verisinden trend etiket önizlemesi — API yokken yedek */
/** Canlı asset verisinden sinyal önizlemesi — RPC boşken yedek */
function buildSignalsFromAssets(assets: MarketAssetView[]): HomeVisualRailLink[] {
  return [...assets]
    .filter((a) => a.signal_active_count > 0)
    .sort((a, b) => b.signal_active_count - a.signal_active_count || b.signal_bull_pct - a.signal_bull_pct)
    .slice(0, 6)
    .map((a, i) => {
      const dir: "BUY" | "SELL" | "HOLD" =
        a.signal_bull_pct >= 58 ? "BUY" : a.signal_bull_pct <= 42 ? "SELL" : "HOLD";
      const trend: "up" | "down" | "flat" =
        dir === "BUY" ? "up" : dir === "SELL" ? "down" : "flat";
      const conf = Math.min(5, Math.max(2, Math.round(a.signal_bull_pct / 18)));
      return {
        label: a.symbol,
        href: `/signals?q=${encodeURIComponent(a.symbol)}`,
        signalDirection: dir,
        confidence: conf,
        timeframe: "1G",
        sparkline: a.sparkline.length > 1 ? a.sparkline : buildSparklineSeries(a.symbol, trend, 14),
        sparkTrend: trend,
        rank: i + 1,
        detail: `Giriş ${fmtPrice(a.price)}`,
        assetName: a.signal_top_analyst ?? a.name,
        trendDelta: `${a.signal_active_count} aktif`,
        trendDeltaAccent: dir === "BUY" ? "up" : dir === "SELL" ? "down" : "neutral",
        isHot: a.signal_active_count >= 5 || conf >= 4,
      };
    });
}

/** API → asset → editorial mock — rail her zaman sinyal gösterir */
function resolveRailSignals(
  liveChips: { trending?: HomeVisualRailLink[] } | undefined,
  liveAssets: MarketAssetView[] | undefined,
  mockMode: boolean,
): HomeVisualRailLink[] {
  if (mockMode) return [...MOCK_SIGNAL_ROWS];

  const fromApi = (liveChips?.trending ?? []).filter((t) => Boolean(t.signalDirection));
  if (fromApi.length > 0) return fromApi;

  const fromAssets = liveAssets?.length ? buildSignalsFromAssets(liveAssets) : [];
  if (fromAssets.length > 0) return fromAssets;

  return [];
}

function buildDiscussionsFromMovers(movers: HomeVisualRailLink[]): HomeVisualRailLink[] {
  if (movers.length === 0) return [];
  return movers.slice(0, 5).map((m, i) => {
    const accent = m.accent === "up" ? "up" : m.accent === "down" ? "down" : "neutral";
    const pctRaw = m.meta?.replace(/[^0-9,.-]/g, "").replace(",", ".") ?? "0";
    const pctNum = Math.abs(parseFloat(pctRaw) || 0);
    const views = `${(3.2 - i * 0.45).toFixed(1).replace(".", ",")}b görüntülenme`;
    return {
      label: m.label.startsWith("#") ? m.label : `#${m.label}`,
      meta: views,
      rank: i + 1,
      href: `/discover?q=${encodeURIComponent(m.label.replace(/^#/, ""))}`,
      trendDelta: accent === "up" ? `+${Math.round(pctNum || 4)}%` : accent === "down" ? `−${Math.round(pctNum || 2)}%` : "+1%",
      trendDeltaAccent: accent,
    };
  });
}

function sortCategoryAssets(assets: MarketAssetView[], category: string): MarketAssetView[] {
  return [...assets].sort((a, b) => {
    const priA = railSymbolPriority(a.symbol, category);
    const priB = railSymbolPriority(b.symbol, category);
    if (priA !== priB) return priA - priB;
    return Math.abs(b.change_percent) - Math.abs(a.change_percent);
  });
}

function buildCategoryPreviews(liveAssets: MarketAssetView[]): CategoryPreview[] {
  return CATEGORY_DEFS.map(({ id, label, category }) => {
    const assets = sortCategoryAssets(
      liveAssets.filter((a) => a.category === category),
      category,
    ).slice(0, RAIL_ITEMS_PER_CATEGORY);

    if (assets.length === 0) return null;

    const avgChange = assets.reduce((sum, a) => sum + a.change_percent, 0) / assets.length;
    const overallSign: CategoryPreview["overallSign"] =
      avgChange > 0.1 ? "up" : avgChange < -0.1 ? "down" : "flat";

    const items: HomeVisualRailLink[] = assets.map((a) => {
      const sign = a.change_percent > 0.04 ? "up" : a.change_percent < -0.04 ? "down" : "neutral";
      return {
        label: a.symbol,
        meta: formatPct(a.change_percent),
        accent: sign === "neutral" ? undefined : sign,
        price: fmtPrice(a.price),
        href: marketSymbolPath(a.symbol),
        sparkline: a.sparkline.length > 1 ? a.sparkline : buildSparklineSeries(a.symbol, a.trend, 16),
        sparkTrend: a.trend,
        assetName: a.name,
        volumeLabel: a.volume,
        signalCount: a.signal_active_count > 0 ? a.signal_active_count : undefined,
      };
    });

    return { id, label, overallSign, items };
  }).filter((c): c is CategoryPreview => c !== null);
}

export function buildEditorialRailBundle(
  intel: InterestIntelligenceSnapshot,
  recommendedCreators?: RecommendedCreatorCard[],
  liveChips?: {
    today: HomeVisualRailLink[];
    trending: HomeVisualRailLink[];
    interests?: HomeVisualRailLink[];
    discussions?: HomeVisualRailLink[];
    newsRows?: MarketNewsDbRow[];
  },
  liveAssets?: MarketAssetView[],
): EditorialRailBundle {
  const repo = getHomeRepository();
  const strip = buildMarketStripShortcuts(liveAssets);
  const creatorSource = recommendedCreators ?? repo.getRecommendedCreators();

  // 5 zenginleştirilmiş creator (12 düz listeden daha iyi)
  const creators = creatorSource.slice(0, 5).map(
    (c): HomeVisualRailLink => ({
      label: c.name,
      meta: c.tier,
      handle: c.handle,
      avatarUrl: c.avatar_url ?? undefined,
      creatorUserId: c.id,
      followerCount: c.follower_count ?? undefined,
      expertise: c.expertise || undefined,
      verified: c.verified,
      signalCount: c.signal_count && c.signal_count > 0 ? c.signal_count : undefined,
    }),
  );

  let interests = buildInterestsFromIntel(intel);
  if (!isMockDataEnabled() && interests.length === 0 && (liveChips?.interests?.length ?? 0) > 0) {
    interests = [...(liveChips?.interests ?? [])];
  }
  if (isMockDataEnabled() && interests.length < 5) {
    const merged = [...interests];
    for (const row of EDITORIAL_MOCK_INTERESTS_FALLBACK) {
      if (merged.some((m) => m.label === row.label)) continue;
      merged.push(row);
      if (merged.length >= 7) break;
    }
    interests = merged;
  }

  const mockMode = isMockDataEnabled();
  const today = mockMode ? [...EDITORIAL_MOCK_TODAY] : (liveChips?.today ?? []);
  const signals = resolveRailSignals(liveChips, liveAssets, mockMode);
  const trending: HomeVisualRailLink[] = [];

  const discussionsFromPosts = liveChips?.discussions ?? [];
  const discussionsFromMovers = buildDiscussionsFromMovers(liveChips?.today ?? []);
  const discussions = isMockDataEnabled()
    ? [...EDITORIAL_MOCK_TRENDING]
    : discussionsFromPosts.length > 0
    ? discussionsFromPosts
    : discussionsFromMovers;

  // Kategori bazlı market preview: live data varsa gerçek, mock modda fallback
  const categoryPreviews: CategoryPreview[] =
    !isMockDataEnabled() && liveAssets && liveAssets.length > 0
      ? buildCategoryPreviews(liveAssets)
      : isMockDataEnabled()
      ? MOCK_CATEGORY_PREVIEWS
      : [];

  const newsItems: RailNewsItem[] =
    isMockDataEnabled()
      ? MOCK_NEWS_FALLBACK
      : (liveChips?.newsRows?.length ?? 0) > 0
      ? buildNewsItems(liveChips!.newsRows!)
      : [];

  return {
    shortcuts: strip,
    today,
    interests,
    trending,
    signals,
    discussions,
    creators,
    categoryPreviews,
    newsItems,
  };
}

function buildMarketStripShortcuts(liveAssets?: MarketAssetView[]): HomeVisualRailLink[] {
  return buildEditorialMarketStripItems(liveAssets).slice(0, 10).map((m) => {
    const isStatic = m.price === "—";
    const sign = m.changePct > 0.04 ? "up" : m.changePct < -0.04 ? "down" : "neutral";
    const pct = isStatic
      ? undefined
      : Math.abs(m.changePct) < 0.0001
      ? "0,00%"
      : `${m.changePct >= 0 ? "+" : ""}${m.changePct.toFixed(2).replace(".", ",")}%`;
    return {
      label: m.symbol,
      meta: pct,
      accent: sign === "neutral" ? undefined : sign,
    };
  });
}
