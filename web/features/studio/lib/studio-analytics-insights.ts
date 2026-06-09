import { studioContentHref } from "@/features/studio/lib/studio-content-href";
import type {
  StudioAnalyticsBundle,
  StudioAudienceSegment,
  StudioTimeframe,
} from "@/features/studio/repository/types";

const TF_LABELS: Record<StudioTimeframe, string> = {
  "7d": "7 Gün",
  "28d": "28 Gün",
  "90d": "90 Gün",
};

export type AnalyticsTopRow = {
  id: string;
  title: string;
  views: number;
  thumbnailUrl: string | null;
  href: string;
  kind: "video" | "short" | "post";
};

export function analyticsBreadcrumb(timeframe: StudioTimeframe): string {
  return `${TF_LABELS[timeframe]} · Tüm içerik`;
}

export function analyticsHasData(bundle: StudioAnalyticsBundle): boolean {
  const { summary } = bundle;
  return (
    summary.totalViews > 0 ||
    summary.publishedContentCount > 0 ||
    summary.signalCopyCount > 0 ||
    bundle.topVideos.length > 0 ||
    bundle.topPosts.length > 0
  );
}

export function buildContentTypeBreakdown(
  posts: Array<{ type?: string | null; views?: number | null }>,
  signalCopyCount: number,
): StudioAudienceSegment[] {
  const buckets: Record<string, number> = {
    Video: 0,
    Short: 0,
    Gönderi: 0,
    Sinyal: 0,
    Canlı: 0,
  };

  for (const p of posts) {
    const t = (p.type ?? "post").toLowerCase();
    const views = p.views ?? 0;
    if (t === "video") buckets.Video += views;
    else if (t === "short") buckets.Short += views;
    else if (t === "signal") buckets.Sinyal += views;
    else if (t === "live") buckets.Canlı += views;
    else buckets.Gönderi += views;
  }

  if (signalCopyCount > 0) {
    buckets.Sinyal += signalCopyCount * 3;
  }

  const total = Object.values(buckets).reduce((a, v) => a + v, 0);
  if (total === 0) return [];

  return Object.entries(buckets)
    .filter(([, v]) => v > 0)
    .map(([label, value]) => ({
      label,
      percent: Math.max(1, Math.round((value / total) * 100)),
    }))
    .sort((a, b) => b.percent - a.percent);
}

export function mapTopVideos(bundle: StudioAnalyticsBundle): AnalyticsTopRow[] {
  return bundle.topVideos.map((v) => ({
    ...v,
    kind: "video" as const,
    href: studioContentHref("video", v.id),
  }));
}

export function mapTopPosts(bundle: StudioAnalyticsBundle): AnalyticsTopRow[] {
  return bundle.topPosts.map((p) => ({
    ...p,
    kind: "post" as const,
    href: studioContentHref("post", p.id),
  }));
}

export function pctClass(n: number): string {
  if (n > 0) return "st-metric-change--up";
  if (n < 0) return "st-metric-change--down";
  return "st-metric-change--neu";
}
