import type { FeedPost } from "@/features/feed/types";

export type SavedIntelChip = { label: string; count: number };

export type SavedIntelligenceBundle = {
  total: number;
  categoryChips: SavedIntelChip[];
  creatorChips: SavedIntelChip[];
  topTheme: string | null;
  trendSummary: string;
  recentCount7d: number;
  videoSharePct: number;
  emptyCta: string | null;
};

function isVideoPost(post: FeedPost): boolean {
  return Boolean(post.video_url?.trim() || post.type === "video" || post.type === "reel");
}

function inferCategory(assetTag: string | null): string {
  const t = (assetTag ?? "").trim().toUpperCase();
  if (!t) return "Genel";
  if (["BTC", "ETH", "SOL", "XRP", "BNB", "DOGE"].some((c) => t.includes(c))) return "Kripto";
  if (["XU100", "BIST", "THYAO", "ASELS", "SISE"].some((c) => t.includes(c))) return "Borsa";
  if (["USD", "EUR", "TRY", "ALTIN", "XAU", "GUMUS"].some((c) => t.includes(c))) return "Döviz & emtia";
  return t;
}

function countMap(rows: string[]): SavedIntelChip[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row, (map.get(row) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
}

/** saved_posts → kategori / üretici dağılımı ve trend özeti. */
export function buildSavedIntelligenceFromPosts(posts: readonly FeedPost[]): SavedIntelligenceBundle {
  const total = posts.length;
  if (total === 0) {
    return {
      total: 0,
      categoryChips: [],
      creatorChips: [],
      topTheme: null,
      trendSummary: "Henüz kayıt yok — gönderilerdeki kaydet simgesiyle koleksiyonunu oluştur.",
      recentCount7d: 0,
      videoSharePct: 0,
      emptyCta: "Keşfet üzerinden ilgi alanına uygun içerik bulabilirsin.",
    };
  }

  const categories = posts.map((p) => inferCategory(p.asset_tag));
  const creators = posts.map((p) => p.author_name?.trim() || p.author_handle?.trim() || "Üretici");
  const categoryChips = countMap(categories).slice(0, 5);
  const creatorChips = countMap(creators).slice(0, 4);
  const topTheme = categoryChips[0]?.label ?? null;

  const weekAgo = Date.now() - 7 * 86_400_000;
  const recentCount7d = posts.filter((p) => new Date(p.created_at).getTime() >= weekAgo).length;
  const videoCount = posts.filter(isVideoPost).length;
  const videoSharePct = Math.round((videoCount / total) * 100);

  let trendSummary = `${total} kayıt`;
  if (topTheme) trendSummary += ` · en yoğun alan ${topTheme}`;
  if (recentCount7d > 0) trendSummary += ` · son 7 günde ${recentCount7d} yeni`;
  if (videoSharePct >= 40) trendSummary += ` · video ağırlıklı (%${videoSharePct})`;

  return {
    total,
    categoryChips,
    creatorChips,
    topTheme,
    trendSummary,
    recentCount7d,
    videoSharePct,
    emptyCta: null,
  };
}
