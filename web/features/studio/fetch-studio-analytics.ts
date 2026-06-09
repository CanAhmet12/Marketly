import type { SupabaseClient } from "@supabase/supabase-js";

import { buildContentTypeBreakdown } from "@/features/studio/lib/studio-analytics-insights";
import type {
  StudioAnalyticsBundle,
  StudioAudienceSegment,
  StudioDashboardOverview,
  StudioMetricPoint,
  StudioTimeframe,
  StudioTopContentRow,
} from "@/features/studio/repository/types";
import { STUDIO_QUICK_ACTIONS } from "@/features/studio/repository/studio-quick-actions";

type AnalyticsRpc = {
  owner_id?: string;
  timeframe?: string;
  total_views?: number;
  total_likes?: number;
  total_comments?: number;
  published_count?: number;
  draft_count?: number;
  scheduled_count?: number;
  follower_count?: number;
  follower_growth_7d?: number;
  signal_copy_count?: number;
  engagement_rate?: number;
  top_posts?: Array<{
    id: string;
    title: string;
    views: number;
    likes?: number;
    thumbnail_url?: string | null;
    image_url?: string | null;
    type?: string;
  }>;
  daily_views?: StudioMetricPoint[];
};

function padSeries(points: StudioMetricPoint[], len: number): StudioMetricPoint[] {
  if (points.length >= len) return points.slice(-len);
  const out = [...points];
  while (out.length < len) {
    out.unshift({ label: `—`, value: 0 });
  }
  return out.slice(-len);
}

function emptyBundle(timeframe: StudioTimeframe): StudioAnalyticsBundle {
  const len = timeframe === "7d" ? 7 : timeframe === "28d" ? 14 : 21;
  const z = (n: number) => Array.from({ length: n }, (_, i) => ({ label: `${i + 1}`, value: 0 }));
  return {
    summary: {
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
      publishedSubtitle: "Henüz içerik yok",
    },
    timeframe,
    viewsSeries: z(len),
    watchTimeSeries: z(len),
    engagementSeries: z(len),
    followerSeries: z(len),
    audienceBreakdown: [],
    contentTypeBreakdown: [],
    topVideos: [],
    topPosts: [],
    topAssets: [],
  };
}

function mapTopVideoRows(
  posts: NonNullable<AnalyticsRpc["top_posts"]>,
): StudioAnalyticsBundle["topVideos"] {
  return posts
    .filter((p) => p.type === "video" || p.type === "short")
    .map((p) => ({
      id: p.id,
      title: p.title,
      views: p.views ?? 0,
      thumbnailUrl: p.thumbnail_url ?? p.image_url ?? null,
    }));
}

function mapTopPostRows(
  posts: NonNullable<AnalyticsRpc["top_posts"]>,
): StudioAnalyticsBundle["topPosts"] {
  return posts
    .filter((p) => !p.type || p.type === "post" || p.type === "signal" || p.type === "live")
    .map((p) => ({
      id: p.id,
      title: p.title,
      views: p.views ?? 0,
      thumbnailUrl: p.thumbnail_url ?? p.image_url ?? null,
    }));
}

function mapTopContent(row: AnalyticsRpc["top_posts"]): StudioTopContentRow[] {
  return (row ?? []).map((p) => {
    const kind = p.type === "video" ? "video" : p.type === "short" ? "short" : p.type === "signal" ? "signal" : p.type === "live" ? "live" : "post";
    return {
      id: p.id,
      kind: kind as StudioTopContentRow["kind"],
      title: p.title,
      views: p.views ?? 0,
      engagement: (p.likes ?? 0) + Math.round((p.views ?? 0) * 0.02),
      thumbnailUrl: p.thumbnail_url ?? p.image_url ?? null,
    };
  });
}

/** `get_studio_analytics_bundle` RPC → StudioAnalyticsBundle */
export async function fetchStudioAnalyticsBundle(
  client: SupabaseClient,
  timeframe: StudioTimeframe,
): Promise<StudioAnalyticsBundle> {
  try {
    const { data, error } = await client.rpc("get_studio_analytics_bundle", { p_timeframe: timeframe });
    if (error || !data) {
      console.warn("[studio] get_studio_analytics_bundle", error?.message);
      return emptyBundle(timeframe);
    }
    const rpc = data as AnalyticsRpc;
    const len = timeframe === "7d" ? 7 : timeframe === "28d" ? 14 : 21;
    const viewsSeries = padSeries(rpc.daily_views ?? [], len);
    const engagementScore = Number(rpc.engagement_rate ?? 0);
    const rpcTopPosts = rpc.top_posts ?? [];
    const topVideos = mapTopVideoRows(rpcTopPosts);
    const topPosts = mapTopPostRows(rpcTopPosts);
    let contentTypeBreakdown: StudioAudienceSegment[] = buildContentTypeBreakdown(
      rpcTopPosts.map((p) => ({ type: p.type, views: p.views })),
      rpc.signal_copy_count ?? 0,
    );

    const {
      data: { user },
    } = await client.auth.getUser();
    const ownerId = user?.id ?? "";

    if (ownerId && contentTypeBreakdown.length === 0) {
      const fallback = await fetchPostsFallback(client, ownerId);
      contentTypeBreakdown = buildContentTypeBreakdown(
        (fallback.topPosts ?? []).map((p) => ({ type: p.type, views: p.views })),
        rpc.signal_copy_count ?? 0,
      );
    }

    return {
      summary: {
        totalViews: rpc.total_views ?? 0,
        viewsChangePercent: 0,
        watchTimeSeconds: Math.round((rpc.total_views ?? 0) * 45),
        watchTimeChangePercent: 0,
        engagementScore,
        engagementChangePercent: 0,
        followerCount: rpc.follower_count ?? 0,
        followerGrowth7d: rpc.follower_growth_7d ?? 0,
        signalCopyCount: rpc.signal_copy_count ?? 0,
        signalCopyChangePercent: 0,
        publishedContentCount: rpc.published_count ?? 0,
        publishedSubtitle: `${rpc.published_count ?? 0} yayın · ${rpc.draft_count ?? 0} taslak`,
      },
      timeframe,
      viewsSeries,
      watchTimeSeries: viewsSeries.map((p) => ({ ...p, value: Math.round(p.value * 0.6) })),
      engagementSeries: viewsSeries.map((p) => ({ ...p, value: Math.round(p.value * 0.08) })),
      followerSeries: padSeries([], len),
      audienceBreakdown: [],
      contentTypeBreakdown,
      topVideos: topVideos.length > 0 ? topVideos : topPosts.slice(0, 3),
      topPosts,
      topAssets: [],
    };
  } catch (e) {
    console.warn("[studio] fetchStudioAnalyticsBundle", e);
    return emptyBundle(timeframe);
  }
}

async function fetchPostsFallback(
  client: SupabaseClient,
  ownerId: string,
): Promise<{ publishedCount: number; topPosts: AnalyticsRpc["top_posts"] }> {
  const { count } = await client
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ownerId);

  const { data: rows } = await client
    .from("posts")
    .select("id, title, type, views_count, likes, thumbnail_url, image_url")
    .eq("user_id", ownerId)
    .order("views_count", { ascending: false })
    .limit(5);

  return {
    publishedCount: count ?? 0,
    topPosts: (rows ?? []).map((p) => ({
      id: String(p.id),
      title: p.title ?? "İsimsiz",
      views: typeof p.views_count === "number" ? p.views_count : 0,
      likes: typeof p.likes === "number" ? p.likes : 0,
      thumbnail_url: p.thumbnail_url ?? null,
      image_url: p.image_url ?? null,
      type: p.type ?? "post",
    })),
  };
}

/** Dashboard overview — analytics RPC + posts fallback */
export async function fetchStudioDashboardOverview(
  client: SupabaseClient,
): Promise<StudioDashboardOverview> {
  const bundle = await fetchStudioAnalyticsBundle(client, "7d");
  const { summary } = bundle;

  const {
    data: { user },
  } = await client.auth.getUser();
  const ownerId = user?.id ?? "";

  let publishedCount = summary.publishedContentCount;
  let topContent = mapTopContent(
    bundle.topPosts.map((p) => ({
      id: p.id,
      title: p.title,
      views: p.views,
      thumbnail_url: p.thumbnailUrl,
      image_url: p.thumbnailUrl,
      type: "post",
    })),
  );

  if (ownerId && publishedCount === 0 && topContent.length === 0) {
    const fallback = await fetchPostsFallback(client, ownerId);
    publishedCount = fallback.publishedCount;
    topContent = mapTopContent(fallback.topPosts);
  }

  const totalViews =
    summary.totalViews > 0
      ? summary.totalViews
      : topContent.reduce((sum, row) => sum + row.views, 0);

  return {
    totalViews,
    followerGrowth7d: summary.followerGrowth7d,
    engagementScore: summary.engagementScore,
    publishedCount,
    draftCount: 0,
    scheduledCount: 0,
    estimatedRevenueUsd: null,
    metricHints: {
      totalViews: summary.totalViews > 0 ? "Son 7 gün" : "Doğrudan içerik",
      followerGrowth: summary.followerGrowth7d > 0 ? `+${summary.followerGrowth7d}` : "—",
      engagement: `${summary.engagementScore}%`,
      published: `${publishedCount} yayın`,
    },
    recentPerformance: bundle.viewsSeries,
    topContent,
    quickActions: STUDIO_QUICK_ACTIONS,
  };
}
