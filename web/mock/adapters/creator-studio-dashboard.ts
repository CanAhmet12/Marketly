import type { StudioDashboardOverview, StudioLocalMutations, StudioQuickAction, StudioTopContentRow } from "@/features/studio/repository/types";
import { STUDIO_QUICK_ACTIONS } from "@/features/studio/repository/studio-quick-actions";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";
import { MOCK_SIGNAL_ROWS } from "@/mock/fixtures/signals";

import { getStudioDrafts, getStudioScheduledPosts } from "./creator-studio-publishing";
import { pickThumb, studioSeed } from "./creator-studio-utils";

function publishedPostsFor(ownerId: string) {
  return MOCK_POST_SOURCES.filter((p) => p.user_id === ownerId && p.type !== "live");
}

function signalsFor(ownerId: string) {
  return MOCK_SIGNAL_ROWS.filter((s) => s.creator_id === ownerId);
}

const STATIC_QUICK_ACTIONS: StudioQuickAction[] = STUDIO_QUICK_ACTIONS;

export function getStudioDashboardOverview(
  ownerId: string,
  local: StudioLocalMutations,
  mockDataset: boolean,
): StudioDashboardOverview {
  if (!mockDataset) {
    return {
      totalViews: 0,
      followerGrowth7d: 0,
      engagementScore: 0,
      publishedCount: 0,
      draftCount: 0,
      scheduledCount: 0,
      estimatedRevenueUsd: null,
      metricHints: {
        totalViews: "Canlı veri: Supabase + creator RPC",
        followerGrowth: "—",
        engagement: "—",
        published: "—",
      },
      recentPerformance: Array.from({ length: 7 }, (_, i) => ({ label: `Gün ${i + 1}`, value: 0 })),
      topContent: [],
      quickActions: STATIC_QUICK_ACTIONS,
    };
  }

  const posts = publishedPostsFor(ownerId);
  const sigs = signalsFor(ownerId);

  const totalViews = posts.reduce((a, p) => a + (p.views_count ?? 0), 0) + sigs.reduce((a, s) => a + (s.copies_count ?? 0) * 3, 0);

  const engagementScore = Math.round(
    posts.reduce((a, p) => a + p.likes + p.comments * 2, 0) / Math.max(1, posts.length + sigs.length),
  );

  const followerGrowth7d = 12 + (studioSeed(ownerId, "fg7") % 180);

  const drafts = getStudioDrafts(ownerId, local, true);
  const scheduled = getStudioScheduledPosts(ownerId, local, true);

  const publishedCount = posts.length + sigs.length;

  const recentLen = 7;
  const recentPerformance = Array.from({ length: recentLen }, (_, i) => {
    const day = String(i + 1);
    const base = studioSeed(ownerId, `rv:${i}`);
    return { label: `Gün ${day}`, value: Math.max(120, Math.floor((totalViews / 90) * (0.6 + (base % 80) / 200))) };
  });

  const topFromPosts: StudioTopContentRow[] = [...posts]
    .sort((a, b) => b.views_count - a.views_count)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      kind: (p.type === "video" || p.type === "short" || p.type === "post" || p.type === "live" || p.type === "signal"
        ? p.type
        : "post") as StudioTopContentRow["kind"],
      title: p.title ?? p.content.slice(0, 80),
      views: p.views_count,
      engagement: p.likes + p.comments,
      thumbnailUrl: pickThumb(p),
    }));

  const postIds = new Set(topFromPosts.map((p) => p.id));
  const topFromSignals: StudioTopContentRow[] = sigs
    .filter((s) => !postIds.has(s.id))
    .slice(0, 2)
    .map((s) => ({
      id: `top-sig-${s.id}`,
      kind: "signal" as const,
      title: `${s.symbol} ${s.direction}`,
      views: s.copies_count * 4,
      engagement: s.likes_count + Math.floor(s.copies_count / 10),
      thumbnailUrl: null,
    }));

  const topContent = [...topFromPosts, ...topFromSignals].sort((a, b) => b.views - a.views).slice(0, 5);

  const revenueSeed = studioSeed(ownerId, "rev");
  const estimatedRevenueUsd = revenueSeed % 5 === 0 ? null : Math.round((revenueSeed % 5000) / 100) / 10;

  const vHint = `${4 + (studioSeed(ownerId, "mhv") % 18)}% (mock dönem)`;
  const fHint = `Organik + Pulse · örnek ${studioSeed(ownerId, "mhf") % 7}/7 gün`;
  const eHint = `Ağırlıklı yorum · skor ${engagementScore}`;
  const pHint = `Taslak ${drafts.length} · Zamanlı ${scheduled.length}`;

  return {
    totalViews,
    followerGrowth7d,
    engagementScore,
    publishedCount,
    draftCount: drafts.length,
    scheduledCount: scheduled.length,
    estimatedRevenueUsd,
    metricHints: {
      totalViews: vHint,
      followerGrowth: fHint,
      engagement: eHint,
      published: pHint,
    },
    recentPerformance,
    topContent,
    quickActions: STATIC_QUICK_ACTIONS,
  };
}
