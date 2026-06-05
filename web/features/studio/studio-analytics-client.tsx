"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { fetchStudioAnalyticsBundle } from "@/features/studio/fetch-studio-analytics";
import { getStudioRepository } from "@/features/studio/repository";
import type { StudioTimeframe } from "@/features/studio/types";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { formatCompactCount } from "@/lib/format-compact-count";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

const TFS: { id: StudioTimeframe; label: string }[] = [
  { id: "7d",  label: "7 Gün" },
  { id: "28d", label: "28 Gün" },
  { id: "90d", label: "90 Gün" },
];

function pctClass(n: number): string {
  if (n > 0) return "st-metric-change--up";
  if (n < 0) return "st-metric-change--down";
  return "st-metric-change--neu";
}

function AreaChart({ series, color, label }: { series: { label: string; value: number }[]; color: string; label: string }) {
  const id = useId().replace(/:/g, "");
  const W = 400; const H = 100; const padX = 4; const padY = 8;
  const vals = series.map((s) => s.value);
  const min = Math.min(...vals); const max = Math.max(...vals);
  const span = max - min || 1;
  const pts = vals.map((v, i) => ({
    x: padX + (i / Math.max(1, vals.length - 1)) * (W - padX * 2),
    y: padY + (1 - (v - min) / span) * (H - padY * 2),
  }));
  let line = `M ${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i-1]!.x + pts[i]!.x) / 2;
    line += ` C ${cpx.toFixed(1)} ${pts[i-1]!.y.toFixed(1)}, ${cpx.toFixed(1)} ${pts[i]!.y.toFixed(1)}, ${pts[i]!.x.toFixed(1)} ${pts[i]!.y.toFixed(1)}`;
  }
  const last = pts[pts.length-1]!; const first = pts[0]!;
  const area = `${line} L ${last.x.toFixed(1)} ${H} L ${first.x.toFixed(1)} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H}
      className="st-chart-svg" aria-label={label}>
      <defs>
        <linearGradient id={`stag-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#stag-${id})`} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 6px ${color}55)` }} />
    </svg>
  );
}

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

  if (!ownerId || !bundle) return null;

  const { summary } = bundle;
  const CHART_COLOR = "#0f9d75";
  const AMBER = "#f59e0b";
  const VIOLET = "#8b5cf6";
  const BLUE = "#3b82f6";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Timeframe + Economy link */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {TFS.map((t) => (
            <button key={t.id} type="button"
              className={cn("st-tf-btn", tf === t.id && "st-tf-btn--active")}
              onClick={() => setTf(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <Link href="/studio/economy" style={{ fontSize: 11, fontWeight: 700, color: "var(--st-accent-dim)", textDecoration: "none" }}>
          Ekonomi & Dönüşüm →
        </Link>
      </div>

      {/* 6 Metrik */}
      <div className="st-metrics" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <div className="st-metric">
          <span className="st-metric-label">Görüntülenme</span>
          <span className="st-metric-value st-metric-value--accent">{formatCompactCount(summary.totalViews)}</span>
          <span className={cn("st-metric-change", pctClass(summary.viewsChangePercent))}>
            {summary.viewsChangePercent >= 0 ? "+" : ""}{summary.viewsChangePercent}%
          </span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">İzlenme Süresi</span>
          <span className="st-metric-value">{formatCompactCount(summary.watchTimeSeconds)}s</span>
          <span className={cn("st-metric-change", pctClass(summary.watchTimeChangePercent))}>
            {summary.watchTimeChangePercent >= 0 ? "+" : ""}{summary.watchTimeChangePercent}%
          </span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">Etkileşim</span>
          <span className="st-metric-value st-metric-value--amber">{summary.engagementScore}</span>
          <span className={cn("st-metric-change", pctClass(summary.engagementChangePercent))}>
            {summary.engagementChangePercent >= 0 ? "+" : ""}{summary.engagementChangePercent}%
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
          <span className="st-metric-value st-metric-value--violet">{formatCompactCount(summary.signalCopyCount)}</span>
          <span className={cn("st-metric-change", pctClass(summary.signalCopyChangePercent))}>
            {summary.signalCopyChangePercent >= 0 ? "+" : ""}{summary.signalCopyChangePercent}%
          </span>
        </div>
        <div className="st-metric">
          <span className="st-metric-label">Yayında İçerik</span>
          <span className="st-metric-value">{summary.publishedContentCount}</span>
          <span className="st-metric-change st-metric-change--neu">{summary.publishedSubtitle}</span>
        </div>
      </div>

      {/* 4 Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { title: "Görüntülenme", series: bundle.viewsSeries, color: CHART_COLOR },
          { title: "İzlenme Süresi", series: bundle.watchTimeSeries, color: AMBER },
          { title: "Etkileşim", series: bundle.engagementSeries, color: VIOLET },
          { title: "Takipçi Büyümesi", series: bundle.followerSeries, color: BLUE },
        ].map((c) => (
          <div key={c.title} className="st-block">
            <div className="st-block-header" style={{ paddingBottom: 0 }}>
              <div className="st-block-title">
                {c.title}
              </div>
            </div>
            <div style={{ padding: "12px 16px 10px" }}>
              <AreaChart series={c.series} color={c.color} label={c.title} />
            </div>
          </div>
        ))}
      </div>

      {/* Kitle + Varlıklar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Kitle dağılımı */}
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">
              Kitle Dağılımı
            </div>
          </div>
          <div className="st-aud-rows">
            {bundle.audienceBreakdown.map((a) => (
              <div key={a.label} className="st-aud-row">
                <span className="st-aud-label">{a.label}</span>
                <div className="st-aud-bar">
                  <div className="st-aud-fill" style={{ width: `${a.percent}%` }} />
                </div>
                <span className="st-aud-pct">{a.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Öne çıkan varlıklar */}
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">
              Sinyal Varlıkları
            </div>
          </div>
          <div style={{ padding: "14px 18px" }}>
            {bundle.topAssets.map((a) => (
              <div key={a.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "7px 0", borderBottom: "1px solid var(--st-border-2)" }}>
                <Link href={`/markets/${encodeURIComponent(a.symbol)}`}
                  style={{ fontSize: 13, fontWeight: 800, color: "var(--st-accent)", textDecoration: "none" }}>
                  {a.symbol}
                </Link>
                <span style={{ fontSize: 11, color: "var(--st-text-2)" }}>
                  {a.mentions} içerik · {formatCompactCount(a.engagement)} etk.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
