"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { StudioAnalyticsBreakdown } from "@/features/studio/components/studio-analytics-breakdown";
import { StudioAnalyticsCharts } from "@/features/studio/components/studio-analytics-charts";
import { StudioAnalyticsHeader } from "@/features/studio/components/studio-analytics-header";
import { StudioAnalyticsTopTable } from "@/features/studio/components/studio-analytics-top-table";
import { StudioSubpageSkeleton } from "@/features/studio/components/studio-states";
import { fetchStudioAnalyticsBundle } from "@/features/studio/fetch-studio-analytics";
import {
  analyticsHasData,
  mapTopPosts,
  mapTopVideos,
  pctClass,
} from "@/features/studio/lib/studio-analytics-insights";
import { getStudioRepository } from "@/features/studio/repository";
import type { StudioTimeframe } from "@/features/studio/types";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { formatCompactCount } from "@/lib/format-compact-count";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

export function StudioAnalyticsClient() {
  const { user } = useAuth();
  const [tf, setTf] = useState<StudioTimeframe>("7d");
  const ownerId = useStudioOwnerId(user);
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const liveQuery = useQuery({
    queryKey: queryKeys.studioAnalytics(tf),
    queryFn: () => fetchStudioAnalyticsBundle(getSupabaseBrowserClient(), tf),
    enabled: liveMode && Boolean(ownerId),
    staleTime: 60_000,
  });

  const bundle = useMemo(() => {
    if (!ownerId) return null;
    if (liveMode) return liveQuery.data ?? null;
    return getStudioRepository().getAnalyticsBundle(ownerId, tf);
  }, [ownerId, tf, liveMode, liveQuery.data]);

  const topVideos = useMemo(() => (bundle ? mapTopVideos(bundle) : []), [bundle]);
  const topPosts = useMemo(() => (bundle ? mapTopPosts(bundle) : []), [bundle]);

  if (!ownerId) {
    return (
      <EmptyState
        title="Giriş gerekli"
        description="Analitik için oturum açın."
        tone="social"
        compact
      />
    );
  }

  if (liveMode && liveQuery.isLoading && !bundle) {
    return <StudioSubpageSkeleton />;
  }

  if (liveMode && liveQuery.isError && !bundle) {
    return (
      <EmptyState
        title="Analitik yüklenemedi"
        description="Veri alınamadı. RPC veya bağlantı sorunu olabilir."
        actionLabel="Yenile"
        onAction={() => void liveQuery.refetch()}
        tone="social"
        compact
      />
    );
  }

  if (!bundle) {
    return <StudioSubpageSkeleton />;
  }

  if (!analyticsHasData(bundle) && !mockOn) {
    return (
      <EmptyState
        title="Henüz analitik veri yok"
        description="İçerik yayınladıkça görüntülenme, etkileşim ve sinyal metrikleri burada görünecek."
        actionLabel="İçerik Yükle"
        actionHref="/upload"
        tone="creator"
        compact
      />
    );
  }

  const { summary } = bundle;

  return (
    <div className="st-dash-stack">
      <StudioAnalyticsHeader
        timeframe={tf}
        onTimeframeChange={setTf}
        isFetching={liveMode && liveQuery.isFetching}
      />

      <div className="st-metrics st-metrics--analytics">
        <div className="st-metric">
          <span className="st-metric-label">Görüntülenme</span>
          <span className="st-metric-value st-metric-value--accent">
            {formatCompactCount(summary.totalViews)}
          </span>
          <span className={cn("st-metric-change", pctClass(summary.viewsChangePercent))}>
            {summary.viewsChangePercent >= 0 ? "+" : ""}
            {summary.viewsChangePercent}%
          </span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">İzlenme Süresi</span>
          <span className="st-metric-value">{formatCompactCount(summary.watchTimeSeconds)}s</span>
          <span className={cn("st-metric-change", pctClass(summary.watchTimeChangePercent))}>
            {summary.watchTimeChangePercent >= 0 ? "+" : ""}
            {summary.watchTimeChangePercent}%
          </span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">Etkileşim</span>
          <span className="st-metric-value st-metric-value--amber">{summary.engagementScore}</span>
          <span className={cn("st-metric-change", pctClass(summary.engagementChangePercent))}>
            {summary.engagementChangePercent >= 0 ? "+" : ""}
            {summary.engagementChangePercent}%
          </span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">Takipçi</span>
          <span className="st-metric-value">{formatCompactCount(summary.followerCount)}</span>
          <span className="st-metric-change st-metric-change--up">
            7g +{formatCompactCount(summary.followerGrowth7d)}
          </span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">Sinyal Kopyası</span>
          <span className="st-metric-value st-metric-value--violet">
            {formatCompactCount(summary.signalCopyCount)}
          </span>
          <span className={cn("st-metric-change", pctClass(summary.signalCopyChangePercent))}>
            {summary.signalCopyChangePercent >= 0 ? "+" : ""}
            {summary.signalCopyChangePercent}%
          </span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">Yayında İçerik</span>
          <span className="st-metric-value">{summary.publishedContentCount}</span>
          <span className="st-metric-change st-metric-change--neu">{summary.publishedSubtitle}</span>
        </div>
      </div>

      <StudioAnalyticsCharts
        series={{
          viewsSeries: bundle.viewsSeries,
          watchTimeSeries: bundle.watchTimeSeries,
          engagementSeries: bundle.engagementSeries,
          followerSeries: bundle.followerSeries,
        }}
      />

      <div className="st-analytics-split-grid">
        <StudioAnalyticsBreakdown
          title="İçerik Türü Dağılımı"
          segments={bundle.contentTypeBreakdown}
          emptyLabel="Görüntülenme türü verisi henüz oluşmadı."
          fillClass="st-aud-fill--violet"
        />
        <StudioAnalyticsBreakdown
          title="Kitle Dağılımı"
          segments={bundle.audienceBreakdown}
          emptyLabel="Coğrafi kitle verisi bu dönemde yok."
        />
      </div>

      <div className="st-analytics-split-grid">
        <StudioAnalyticsTopTable title="En İyi Videolar" rows={topVideos} />
        <StudioAnalyticsTopTable title="En İyi Gönderiler" rows={topPosts} />
      </div>

      <div className="st-block">
        <div className="st-block-header">
          <div className="st-block-title">Sinyal Varlıkları</div>
          <Link href="/signals" className="st-block-link">
            Sinyaller →
          </Link>
        </div>
        {bundle.topAssets.length === 0 ? (
          <div className="st-analytics-empty">Bu dönemde öne çıkan varlık yok.</div>
        ) : (
          <div className="st-analytics-assets">
            {bundle.topAssets.map((a) => (
              <div key={a.symbol} className="st-analytics-asset-row">
                <Link href={`/markets/${encodeURIComponent(a.symbol)}`} className="st-analytics-asset-symbol">
                  {a.symbol}
                </Link>
                <span className="st-analytics-asset-meta">
                  {a.mentions} içerik · {formatCompactCount(a.engagement)} etk.
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
