import type { StudioAnalyticsBundle, StudioAudienceSegment, StudioMetricPoint, StudioTimeframe, AnalyticsSummary } from "@/features/studio/types";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";
import { MOCK_SIGNAL_ROWS } from "@/mock/fixtures/signals";

import { pickThumb, studioSeed } from "./creator-studio-utils";

function postsFor(ownerId: string) {
  return MOCK_POST_SOURCES.filter((p) => p.user_id === ownerId);
}

function series(ownerId: string, salt: string, len: number, scale: number): StudioMetricPoint[] {
  return Array.from({ length: len }, (_, i) => {
    const v = studioSeed(ownerId, `${salt}:${i}`);
    return { label: `${i + 1}`, value: Math.max(10, Math.floor((v % 1000) * scale)) };
  });
}

export function getStudioAnalyticsBundle(ownerId: string, timeframe: StudioTimeframe, mockDataset: boolean): StudioAnalyticsBundle {
  const len = timeframe === "7d" ? 7 : timeframe === "28d" ? 14 : 21;

  if (!mockDataset) {
    const summary: AnalyticsSummary = {
      totalViews: 0,
      viewsChangePercent: 0,
      watchTimeSeconds: 0,
      watchTimeChangePercent: 0,
      engagementScore: 0,
      engagementChangePercent: 0,
      followerCount: 0,
      followerGrowth7d: 0,
      signalCopyCount: 0,
      signalCopyChangePercent: 0,
      publishedContentCount: 0,
      publishedSubtitle: "Canlı veri bekleniyor",
    };
    const z = (n: number): StudioMetricPoint[] => Array.from({ length: n }, (_, i) => ({ label: `${i + 1}`, value: 0 }));
    return {
      summary,
      timeframe,
      viewsSeries: z(len),
      watchTimeSeries: z(len),
      engagementSeries: z(len),
      followerSeries: z(len),
      audienceBreakdown: [],
      topVideos: [],
      topPosts: [],
      topAssets: [],
    };
  }

  const posts = postsFor(ownerId);
  const sigs = MOCK_SIGNAL_ROWS.filter((s) => s.creator_id === ownerId);

  const totalViews = posts.reduce((a, p) => a + p.views_count, 0) + sigs.reduce((a, s) => a + s.copies_count * 2, 0);
  const watchTimeSeconds = posts.reduce((a, p) => a + (p.duration ?? 0), 0) + sigs.length * 420;

  const summary: AnalyticsSummary = {
    totalViews,
    viewsChangePercent: 4 + (studioSeed(ownerId, "vc") % 20),
    watchTimeSeconds,
    watchTimeChangePercent: 2 + (studioSeed(ownerId, "wc") % 15),
    engagementScore: Math.round(posts.reduce((a, p) => a + p.likes + p.comments, 0) / Math.max(1, posts.length)),
    engagementChangePercent: 1 + (studioSeed(ownerId, "ec") % 12),
    followerCount: 1200 + (studioSeed(ownerId, "fc") % 9000),
    followerGrowth7d: 12 + (studioSeed(ownerId, "fg") % 200),
    signalCopyCount: sigs.reduce((a, s) => a + s.copies_count, 0),
    signalCopyChangePercent: 3 + (studioSeed(ownerId, "sc") % 18),
    publishedContentCount: posts.length + sigs.length,
    publishedSubtitle: `VOD ${posts.filter((p) => p.type === "video" || p.type === "short").length} · gönderi ${posts.filter((p) => p.type === "post").length} · sinyal ${sigs.length}`,
  };

  const audienceBreakdown: StudioAudienceSegment[] = [
    { label: "Türkiye", percent: 42 + (studioSeed(ownerId, "aud1") % 15) },
    { label: "AB / UK", percent: 18 + (studioSeed(ownerId, "aud2") % 10) },
    { label: "MENA", percent: 10 + (studioSeed(ownerId, "aud3") % 8) },
    { label: "Diğer", percent: 8 + (studioSeed(ownerId, "aud4") % 6) },
  ];
  const sum = audienceBreakdown.reduce((a, x) => a + x.percent, 0);
  audienceBreakdown.forEach((x) => {
    x.percent = Math.round((x.percent / sum) * 100);
  });

  const topVideos = posts
    .filter((p) => p.type === "video" || p.type === "short")
    .sort((a, b) => b.views_count - a.views_count)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title ?? p.content.slice(0, 60),
      views: p.views_count,
      thumbnailUrl: pickThumb(p),
    }));

  const topPosts = posts
    .filter((p) => p.type === "post")
    .sort((a, b) => b.views_count - a.views_count)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title ?? p.content.slice(0, 60),
      views: p.views_count,
      thumbnailUrl: pickThumb(p),
    }));

  const symMap = new Map<string, { mentions: number; engagement: number }>();
  for (const p of posts) {
    const tag = p.asset_tag ?? "GENEL";
    const cur = symMap.get(tag) ?? { mentions: 0, engagement: 0 };
    cur.mentions += 1;
    cur.engagement += p.likes + p.comments;
    symMap.set(tag, cur);
  }
  const topAssets = [...symMap.entries()]
    .map(([symbol, v]) => ({ symbol, mentions: v.mentions, engagement: v.engagement }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 6);

  return {
    summary,
    timeframe,
    viewsSeries: series(ownerId, "vs", len, totalViews / 80000),
    watchTimeSeries: series(ownerId, "ws", len, watchTimeSeconds / 40000),
    engagementSeries: series(ownerId, "es", len, summary.engagementScore / 50),
    followerSeries: series(ownerId, "fs", len, summary.followerCount / 5000),
    audienceBreakdown,
    topVideos,
    topPosts,
    topAssets,
  };
}
