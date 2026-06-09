import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { isMockDataEnabled } from "@/mock/config";

/** Kanonik haber detay rotası */
export function marketNewsDetailHref(id: string): string {
  return `/market-news/${encodeURIComponent(id)}`;
}

export function marketNewsShareUrl(id: string): string {
  if (typeof window === "undefined") return marketNewsDetailHref(id);
  return `${window.location.origin}${marketNewsDetailHref(id)}`;
}

export type MarketNewsShareResult = "shared" | "copied" | "failed";

export async function shareMarketNews(
  item: Pick<MarketNewsIntelligenceItem, "id" | "headline">,
): Promise<MarketNewsShareResult> {
  const url = marketNewsShareUrl(item.id);
  const text = item.headline;
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: "Marketly · Piyasa Haberleri", text, url });
      return "shared";
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      return "copied";
    }
    return "failed";
  } catch {
    return "failed";
  }
}

/** MC-003: Yalnızca mock modda kullanılır. Live modda Unsplash yüklenmez. */
const NEWS_PHOTOS: Record<string, string> = {
  "nw-f1": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  "nw-f2": "https://images.unsplash.com/photo-1549421263-5ec394a5ad4c?auto=format&fit=crop&w=1200&q=80",
  "nw-f3": "https://images.unsplash.com/photo-1611324586430-0cb2a92b1e59?auto=format&fit=crop&w=1200&q=80",
  "nw-1": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
  "nw-2": "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1200&q=80",
  "nw-3": "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?auto=format&fit=crop&w=1200&q=80",
  "nw-4": "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80",
  "nw-5": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  "nw-6": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
  "nw-7": "https://images.unsplash.com/photo-1578319439584-104c94d37305?auto=format&fit=crop&w=1200&q=80",
  "nw-8": "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=80",
  "nw-9": "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80",
  "nw-10": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
  "nw-11": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  "nw-12": "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=1200&q=80",
};

/** MC-003: Yalnızca mock modda kullanılır. */
const CAT_PHOTOS: Record<string, string> = {
  crypto: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80",
  macro: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  earnings: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1200&q=80",
  flows: "https://images.unsplash.com/photo-1578319439584-104c94d37305?auto=format&fit=crop&w=1200&q=80",
  local: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
};

/** MC-003: Kategori rengi bazlı neutral SVG placeholder (Unsplash'e bağımlılık yok). */
function neutralPlaceholder(category?: string): string {
  const colors: Record<string, string> = {
    crypto: "%23d4920a", macro: "%234a90e8", earnings: "%2322a06b",
    flows: "%237c5cfc", local: "%2314a89a",
  };
  const fill = colors[category ?? ""] ?? "%236b7280";
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect width='1200' height='630' fill='${fill}22'/%3E%3Ccircle cx='600' cy='315' r='60' fill='${fill}44'/%3E%3C/svg%3E`;
}

export const NEWS_CAT_CFG = {
  crypto: {
    label: "Kripto",
    tabLabel: "Kripto",
    shortLabel: "Kripto",
    stripe: "#d4920a",
    tone: "#d4920a",
    tone2: "#9a5f00",
    tabCls: "mn-tab--crypto",
  },
  macro: {
    label: "Ekonomi",
    tabLabel: "Ekonomi",
    shortLabel: "Makro",
    stripe: "#1e5cb8",
    tone: "#4a90e8",
    tone2: "#1e5cb8",
    tabCls: "mn-tab--macro",
  },
  earnings: {
    label: "Şirketler",
    tabLabel: "Şirketler",
    shortLabel: "Şirket",
    stripe: "#0f7049",
    tone: "#22a06b",
    tone2: "#0f7049",
    tabCls: "mn-tab--earnings",
  },
  flows: {
    label: "Emtia & Akış",
    tabLabel: "Emtia & Akış",
    shortLabel: "Akış",
    stripe: "#5535b8",
    tone: "#7c5cfc",
    tone2: "#5535b8",
    tabCls: "mn-tab--flows",
  },
  local: {
    label: "Türkiye",
    tabLabel: "Türkiye",
    shortLabel: "TR",
    stripe: "#0a7068",
    tone: "#14a89a",
    tone2: "#0a7068",
    tabCls: "mn-tab--local",
  },
} as const;

export type NewsCategoryKey = keyof typeof NEWS_CAT_CFG;

/**
 * MC-003: Mock false iken gerçek image_url önceliklidir.
 * Gerçek görsel yoksa neutral SVG placeholder döner (Unsplash kullanılmaz).
 * Mock true iken eski Unsplash fallback davranışı korunur.
 */
export function getMarketNewsPhoto(
  item: Pick<MarketNewsIntelligenceItem, "id" | "newsCategory"> & { imageUrl?: string | null }
): string {
  if (!isMockDataEnabled()) {
    // Live mod: gerçek URL varsa kullan, yoksa neutral placeholder
    if (item.imageUrl) return item.imageUrl;
    return neutralPlaceholder(item.newsCategory);
  }
  // Mock mod: eski Unsplash davranışı
  return NEWS_PHOTOS[item.id] ?? CAT_PHOTOS[item.newsCategory] ?? CAT_PHOTOS.macro;
}

export function formatNewsTimeAgo(mins: number): string {
  if (mins < 60) return `${mins} dk önce`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

export function formatNewsPublishedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSentimentLabel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("positive") || s.includes("bullish")) return "Pozitif sentiment";
  if (s.includes("negative") || s.includes("bearish")) return "Negatif sentiment";
  if (s.includes("neutral")) return "Nötr sentiment";
  return raw.trim() || null;
}

export function newsIntelBullets(item: MarketNewsIntelligenceItem): string[] {
  return [item.discussionSnippet, item.marketReaction, item.volatilityExpectation].filter(
    (b) => Boolean(b?.trim()) && b.trim() !== "—",
  );
}
