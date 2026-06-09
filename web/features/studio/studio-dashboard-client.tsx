"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { StudioAreaChart } from "@/features/studio/components/studio-area-chart";
import { StudioSubpageSkeleton } from "@/features/studio/components/studio-states";
import { fetchStudioDashboardOverview, fetchStudioAnalyticsBundle } from "@/features/studio/fetch-studio-analytics";
import {
  buildStudioNotifications,
  buildStudioTips,
} from "@/features/studio/lib/studio-dashboard-insights";
import type { StudioTopContentRow } from "@/features/studio/repository";
import { getStudioRepository } from "@/features/studio/repository";
import type { StudioTimeframe } from "@/features/studio/types";
import { useStudioLocalMutations } from "@/features/studio/use-studio-local-mutations";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { liveHrefForPostId } from "@/features/live/live-href";
import { pulseHrefForPostId } from "@/features/pulse/pulse-href";
import { formatCompactCount } from "@/lib/format-compact-count";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

const CHART_TFS: { id: StudioTimeframe; label: string }[] = [
  { id: "7d", label: "7g" },
  { id: "28d", label: "28g" },
  { id: "90d", label: "90g" },
];

function contentHref(row: StudioTopContentRow): string {
  if (row.kind === "signal") return `/signals`;
  if (row.kind === "short") return pulseHrefForPostId(row.id);
  if (row.kind === "live") return liveHrefForPostId(row.id);
  if (row.kind === "video") return `/watch/${encodeURIComponent(row.id)}`;
  return `/post/${encodeURIComponent(row.id)}`;
}

function kindLabel(kind: string): string {
  const m: Record<string, string> = {
    video: "VID",
    live: "LIVE",
    signal: "SIG",
    post: "POST",
    short: "SHORT",
  };
  return m[kind] ?? "—";
}

export function StudioDashboardClient() {
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const { mutations } = useStudioLocalMutations(mockOn);
  const ownerId = useStudioOwnerId(user);
  const [chartTf, setChartTf] = useState<StudioTimeframe>("7d");

  const liveQuery = useQuery({
    queryKey: queryKeys.studioDashboard(ownerId),
    queryFn: () => fetchStudioDashboardOverview(getSupabaseBrowserClient()),
    enabled: liveMode && Boolean(ownerId),
    staleTime: 60_000,
  });

  const chartQuery = useQuery({
    queryKey: queryKeys.studioAnalytics(chartTf),
    queryFn: () => fetchStudioAnalyticsBundle(getSupabaseBrowserClient(), chartTf),
    enabled: liveMode && Boolean(ownerId),
    staleTime: 60_000,
  });

  const data = useMemo(() => {
    if (!ownerId) return null;
    if (liveMode) return liveQuery.data ?? null;
    return getStudioRepository().getDashboardOverview(ownerId, mutations);
  }, [ownerId, mutations, liveMode, liveQuery.data]);

  const perfSeries = useMemo(() => {
    if (!ownerId) return [];
    if (liveMode) return chartQuery.data?.viewsSeries ?? [];
    return getStudioRepository().getAnalyticsBundle(ownerId, chartTf).viewsSeries;
  }, [ownerId, chartTf, liveMode, chartQuery.data]);

  const economy = useMemo(() => {
    if (!ownerId) return null;
    return getStudioRepository().getCreatorEconomyHub(ownerId);
  }, [ownerId]);

  const displayName = user?.email?.split("@")[0] ?? "Creator";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (!ownerId) {
    return (
      <EmptyState
        title="Giriş gerekli"
        description="Studio özeti için oturum açın."
        tone="social"
        compact
      />
    );
  }

  if (liveMode && liveQuery.isLoading && !data) {
    return <StudioSubpageSkeleton />;
  }

  if (liveMode && liveQuery.isError && !data) {
    return (
      <EmptyState
        title="Dashboard yüklenemedi"
        description="Analitik verisi alınamadı. Bağlantınızı kontrol edip tekrar deneyin."
        actionLabel="Yenile"
        onAction={() => void liveQuery.refetch()}
        tone="social"
        compact
      />
    );
  }

  if (!data) {
    return <StudioSubpageSkeleton />;
  }

  const hasRealContent =
    mockOn || data.publishedCount > 0 || data.totalViews > 0 || data.followerGrowth7d !== 0;

  if (!hasRealContent) {
    return (
      <EmptyState
        title="Henüz içerik yok"
        description="İlk içeriğini yükleyerek Creator Studio'yu aktifleştir. Metrikler ve analizler burada görünecek."
        actionLabel="İlk İçeriği Yükle"
        actionHref="/upload"
        tone="creator"
        compact
      />
    );
  }

  const notifications = buildStudioNotifications(data);
  const tips = buildStudioTips(data, hasRealContent);
  const chartLoading = liveMode && chartQuery.isFetching && perfSeries.length === 0;

  return (
    <div className="st-dash-stack">

      <div className="st-hero">
        <div className="st-hero-left">
          <div className="st-hero-avatar">{initials}</div>
          <div className="st-hero-info">
            <span className="st-hero-tag">Creator Home</span>
            <div className="st-hero-name">{displayName}</div>
            <div className="st-hero-badges">
              <span className="st-badge st-badge--verified">Aktif</span>
              {data.publishedCount > 0 ? (
                <span className="st-badge st-badge--pro">{data.publishedCount} yayın</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="st-hero-stats">
          <div className="st-hero-stat">
            <div className="st-hero-stat-val">{formatCompactCount(data.totalViews)}</div>
            <div className="st-hero-stat-label">Toplam İzlenme</div>
          </div>
          <div className="st-hero-stat">
            <div className="st-hero-stat-val">+{formatCompactCount(data.followerGrowth7d)}</div>
            <div className="st-hero-stat-label">7g Takipçi</div>
          </div>
          <div className="st-hero-stat">
            <div className="st-hero-stat-val">{data.engagementScore}</div>
            <div className="st-hero-stat-label">Etkileşim</div>
          </div>
        </div>

        <div className="st-hero-actions">
          <Link href="/upload" className="studio-hbtn studio-hbtn--accent">Yeni İçerik</Link>
          <Link href="/studio/live" className="studio-hbtn studio-hbtn--live">Canlı Yayın</Link>
          <Link href="/studio/analytics" className="studio-hbtn studio-hbtn--ghost">Analitik</Link>
        </div>
      </div>

      <div className="st-metrics">
        <div className="st-metric">
          <span className="st-metric-label">Görüntülenme</span>
          <span className="st-metric-value">{formatCompactCount(data.totalViews)}</span>
          <span className="st-metric-change st-metric-change--up">{data.metricHints.totalViews}</span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">7g Takipçi</span>
          <span className="st-metric-value">+{formatCompactCount(data.followerGrowth7d)}</span>
          <span className="st-metric-change st-metric-change--up">{data.metricHints.followerGrowth}</span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">Etkileşim</span>
          <span className="st-metric-value">{data.engagementScore}</span>
          <span className="st-metric-change st-metric-change--neu">{data.metricHints.engagement}</span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">Yayında</span>
          <span className="st-metric-value">{data.publishedCount}</span>
          <span className="st-metric-change st-metric-change--neu">{data.metricHints.published}</span>
        </div>
        {data.estimatedRevenueUsd != null && (
          <div className="st-metric">
            <span className="st-metric-label">Tahmini Gelir</span>
            <span className="st-metric-value">${data.estimatedRevenueUsd.toFixed(2)}</span>
            <span className="st-metric-change st-metric-change--neu">Bu ay</span>
          </div>
        )}
      </div>

      <div className="st-dash-row st-dash-row--chart">
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">Performans Grafiği</div>
            <div className="st-chart-tf">
              {CHART_TFS.map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  className={cn("st-tf-btn", chartTf === tf.id && "st-tf-btn--active")}
                  onClick={() => setChartTf(tf.id)}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
          <div className="st-chart-wrap">
            {chartLoading ? (
              <div className="st-chart-empty" style={{ height: 120 }} aria-busy="true">
                Yükleniyor…
              </div>
            ) : (
              <StudioAreaChart series={perfSeries} color="var(--st-chart-views)" label="Görüntülenme trendi" />
            )}
            {perfSeries.length > 0 ? (
              <div className="st-chart-labels">
                {perfSeries.map((p) => (
                  <span key={p.label} className="st-chart-label">
                    {p.label.replace("Gün ", "")}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">Hızlı İşlemler</div>
          </div>
          <div className="st-quick-actions">
            {data.quickActions.map((a) => (
              <Link
                key={a.id}
                href={a.href}
                className={cn(
                  "st-qa-link",
                  a.variant === "primary" && "st-qa-link--primary",
                  a.variant === "secondary" && "st-qa-link--secondary",
                  a.variant === "ghost" && "st-qa-link--ghost",
                )}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="st-dash-row st-dash-row--split">
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">Öne Çıkan İçerik</div>
            <Link href="/studio/content" className="st-block-link">Tümü →</Link>
          </div>
          <div className="st-top-content">
            {data.topContent.length === 0 ? (
              <div className="st-feed-item st-feed-item--static">
                <div className="st-feed-body">Henüz öne çıkan içerik yok.</div>
              </div>
            ) : (
              data.topContent.map((row) => (
                <Link key={row.id} href={contentHref(row)} className="st-content-row">
                  <div className="st-content-row-thumb">
                    {row.thumbnailUrl ? (
                      <img src={row.thumbnailUrl} alt="" />
                    ) : (
                      <span className="st-list-thumb-placeholder">{kindLabel(row.kind)}</span>
                    )}
                  </div>
                  <div className="st-content-row-info">
                    <div className="st-content-row-title">{row.title}</div>
                    <div className="st-content-row-meta">
                      <span style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 9 }}>
                        {row.kind}
                      </span>
                      {" · "}etkileşim {formatCompactCount(row.engagement)}
                    </div>
                  </div>
                  <div className="st-content-row-views">{formatCompactCount(row.views)}</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="st-dash-rail">
          <div className="st-block">
            <div className="st-block-header">
              <div className="st-block-title">Bildirimler</div>
            </div>
            <div className="st-feed-list">
              {notifications.map((n) =>
                n.href ? (
                  <Link
                    key={n.id}
                    href={n.href}
                    className={cn(
                      "st-feed-item",
                      n.tone === "action" && "st-feed-item--action",
                      n.tone === "success" && "st-feed-item--success",
                    )}
                  >
                    <div className="st-feed-title">{n.title}</div>
                    <div className="st-feed-body">{n.body}</div>
                  </Link>
                ) : (
                  <div key={n.id} className="st-feed-item st-feed-item--static">
                    <div className="st-feed-title">{n.title}</div>
                    <div className="st-feed-body">{n.body}</div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="st-block">
            <div className="st-block-header">
              <div className="st-block-title">Sana Önerilen</div>
            </div>
            {tips.map((tip) => (
              <div key={tip.id} className="st-tip-card">
                <div className="st-tip-title">{tip.title}</div>
                <p className="st-tip-body">{tip.body}</p>
                <Link href={tip.href} className="st-tip-cta">
                  {tip.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {economy ? (
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">Ekonomi Özeti</div>
            <Link href="/studio/economy" className="st-block-link">Detay →</Link>
          </div>
          <div className="st-economy-blurb">
            <div className="st-economy-headline">{economy.headline}</div>
            <div className="st-economy-sub">{economy.subline}</div>
            <Link href="/studio/economy" className="st-economy-cta">
              İşletim Merkezi →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
