import { isLongVideoPost, isPulsePost, isSignalPost, isVideoLikePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import { homeHrefForFeedPost } from "@/features/home/routing";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { mapMockPostToFeedPost } from "@/mock/adapters/feed";
import { getMockCreatedPosts } from "@/mock/adapters/upload-store";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";

export type SignalSidecarLink = { id: string; title: string; href: string };

function normSym(tag: string | null | undefined): string | null {
  if (!tag?.trim()) return null;
  return tag.replace(/^#/, "").trim().toUpperCase();
}

function mergedMockPostsAsFeed(): FeedPost[] {
  const created = getMockCreatedPosts();
  const skip = new Set(created.map((c) => c.id));
  const merged = [...created, ...MOCK_POST_SOURCES.filter((p) => !skip.has(p.id))];
  return merged.map((src) => mapMockPostToFeedPost(src, null, null));
}

function titleFor(p: FeedPost): string {
  const t = p.title?.trim();
  if (t) return t.length > 72 ? `${t.slice(0, 72)}…` : t;
  const c = p.content?.trim() ?? "";
  return c.length > 72 ? `${c.slice(0, 72)}…` : c || "Gönderi";
}

function pickLinks(posts: FeedPost[], take: number, pred: (p: FeedPost) => boolean): SignalSidecarLink[] {
  const out: SignalSidecarLink[] = [];
  const seen = new Set<string>();
  for (const p of posts) {
    if (out.length >= take) break;
    if (!pred(p) || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push({ id: p.id, title: titleFor(p), href: homeHrefForFeedPost(p) });
  }
  return out;
}

export function getMockSignalDetailSidecars(row: SignalsFeedRow): {
  videos: SignalSidecarLink[];
  pulse: SignalSidecarLink[];
  discussions: SignalSidecarLink[];
  previewComments: { author: string; text: string; meta: string }[];
} {
  const sym = row.symbol.trim().toUpperCase();
  const posts = mergedMockPostsAsFeed();
  const byAsset = posts.filter((p) => normSym(p.asset_tag) === sym && !isSignalPost(p));
  const byCreator = posts.filter((p) => p.user_id === row.creator_id && !isSignalPost(p));

  const mergedUnique = [...byCreator, ...byAsset].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

  return {
    videos: pickLinks(byAsset, 3, (p) => isLongVideoPost(p)),
    pulse: pickLinks(byAsset, 3, (p) => isPulsePost(p)),
    discussions: pickLinks(mergedUnique, 3, (p) => !isVideoLikePost(p)),
    previewComments: [
      { author: "Kurumsal izleyici", text: `${row.symbol} için giriş bölgesi hâlâ geçerli mi?`, meta: "2s önce" },
      { author: "SwingLab", text: "Korelasyonlu shortları küçülttüm; teşekkürler.", meta: "18dk önce" },
      { author: row.analyst.display, text: "Hacim onayı gelene kadar parçalı giriş öneriyorum.", meta: "1s önce" },
    ],
  };
}
