"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { fetchStudioDashboardOverview } from "@/features/studio/fetch-studio-analytics";
import type { StudioTopContentRow } from "@/features/studio/repository";
import { getStudioRepository } from "@/features/studio/repository";
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

function contentHref(row: StudioTopContentRow): string {
  if (row.kind === "signal") return `/signals`;
  if (row.kind === "short") return pulseHrefForPostId(row.id);
  if (row.kind === "live") return liveHrefForPostId(row.id);
  if (row.kind === "video") return `/watch/${encodeURIComponent(row.id)}`;
  return `/post/${encodeURIComponent(row.id)}`;
}

function kindLabel(kind: string): string {
  const m: Record<string, string> = { video: "VID", live: "LIVE", signal: "SIG", post: "POST", short: "SHORT" };
  return m[kind] ?? "—";
}

/** SVG alan grafiği */
function AreaChart({ series, color, label }: { series: { label: string; value: number }[]; color: string; label: string }) {
  const id = useId().replace(/:/g, "");
  const W = 500; const H = 120; const padX = 8; const padY = 10;
  const vals = series.map((s) => s.value);
  const min = Math.min(...vals); const max = Math.max(...vals);
  const span = max - min || 1;
  const pts = vals.map((v, i) => ({
    x: padX + (i / (vals.length - 1)) * (W - padX * 2),
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
        <linearGradient id={`stg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#stg-${id})`} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 8px ${color}66)` }} />
    </svg>
  );
}

export function StudioDashboardClient() {
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const { mutations } = useStudioLocalMutations(mockOn);
  const ownerId = useStudioOwnerId(user);
  const [chartTf, setChartTf] = useState("7g");

  const liveQuery = useQuery({
    queryKey: queryKeys.studioDashboard(ownerId),
    queryFn: () => fetchStudioDashboardOverview(getSupabaseBrowserClient()),
    enabled: liveMode && Boolean(ownerId),
    staleTime: 60_000,
  });

  const data = useMemo(() => {
    if (!ownerId) return null;
    if (liveMode) return liveQuery.data ?? null;
    return getStudioRepository().getDashboardOverview(ownerId, mutations);
  }, [ownerId, mutations, liveMode, liveQuery.data]);

  const economy = useMemo(() => {
    if (!ownerId) return null;
    return getStudioRepository().getCreatorEconomyHub(ownerId);
  }, [ownerId]);

  const displayName = user?.email?.split("@")[0] ?? "Creator";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (!ownerId || !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="st-hero" style={{ opacity: 0.4, minHeight: 100 }} />
        <div className="st-metrics" style={{ opacity: 0.4, minHeight: 80 }} />
      </div>
    );
  }

  // ES-001: mock=false + gerçek içerik yok → empty state göster
  const hasRealContent = mockOn || data.publishedCount > 0 || data.totalViews > 0 || data.followerGrowth7d !== 0;
  if (!hasRealContent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "64px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🎬</div>
        <div style={{ fontWeight: 700, fontSize: 20 }}>Henüz içerik yok</div>
        <div style={{ color: "var(--color-meta, #9CA3AF)", fontSize: 14, maxWidth: 320 }}>
          İlk içeriğini yükleyerek Creator Studio'yu aktifleştir. Metrikler ve analizler burada görünecek.
        </div>
        <a href="/upload" className="studio-hbtn" style={{ padding: "10px 24px", fontSize: 14, textDecoration: "none" }}>
          + İlk İçeriği Yükle
        </a>
      </div>
    );
  }

  /* Performans serisi chart için */
  const perfSeries = data.recentPerformance.map((p) => ({ label: p.label, value: p.value }));
  const chartTFs = ["7g", "28g", "90g"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ===== CREATOR HERO ===== */}
      <div className="st-hero">
        <div className="st-hero-left">
          <div className="st-hero-avatar">{initials}</div>
          <div className="st-hero-info">
            <span className="st-hero-tag">Creator Studio</span>
            <div className="st-hero-name">{displayName}</div>
            <div className="st-hero-badges">
              <span className="st-badge st-badge--verified">Doğrulandı</span>
              <span className="st-badge st-badge--pro">Pro</span>
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
          <Link href="/studio/live" className="studio-hbtn studio-hbtn--live">Canlı Yayın</Link>
          <Link href="/studio/content" className="studio-hbtn studio-hbtn--accent">Yeni İçerik</Link>
          <Link href="/studio/analytics" className="studio-hbtn studio-hbtn--ghost">Analitik</Link>
        </div>
      </div>

      {/* ===== 5 METRİK ===== */}
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

      {/* ===== ORTA: Grafik + Top Content ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 16 }}
           className="min-[1100px]:flex-row" /* responsive via CSS */>

        {/* Performans grafiği */}
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">
              Performans Grafiği
            </div>
            <div className="st-chart-tf">
              {chartTFs.map((tf) => (
                <button key={tf} type="button"
                  className={cn("st-tf-btn", chartTf === tf && "st-tf-btn--active")}
                  onClick={() => setChartTf(tf)}>
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="st-chart-wrap">
            <AreaChart series={perfSeries} color="#0f9d75" label="Görüntülenme trendi" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 4px" }}>
              {perfSeries.map((p) => (
                <span key={p.label} style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>
                  {p.label.replace("Gün ", "")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">
              Hızlı İşlemler
            </div>
          </div>
          <div className="st-quick-actions">
            {data.quickActions.map((a) => (
              <Link key={a.id} href={a.href}
                className={cn(
                  "st-qa-link",
                  a.variant === "primary"   && "st-qa-link--primary",
                  a.variant === "secondary" && "st-qa-link--secondary",
                  a.variant === "ghost"     && "st-qa-link--ghost",
                )}>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ALTTA: Top Content + Economy + Signal ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

        {/* Öne çıkan içerik */}
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">
              Öne Çıkan İçerik
            </div>
            <Link href="/studio/content" className="st-block-link">Tümü →</Link>
          </div>
          <div className="st-top-content" style={{ marginTop: 8 }}>
            {data.topContent.map((row) => (
              <Link key={row.id} href={contentHref(row)} className="st-content-row">
                <div className="st-content-row-thumb">
                  {row.thumbnailUrl
                    ? <img src={row.thumbnailUrl} alt="" />
                    : <span style={{ fontSize: 9, letterSpacing: "0.06em", color: "var(--st-meta)", textTransform: "uppercase" }}>{kindLabel(row.kind)}</span>}
                </div>
                <div className="st-content-row-info">
                  <div className="st-content-row-title">{row.title}</div>
                  <div className="st-content-row-meta">
                    <span style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 9 }}>{row.kind}</span>
                    {" · "}etkileşim {formatCompactCount(row.engagement)}
                  </div>
                </div>
                <div className="st-content-row-views">{formatCompactCount(row.views)}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Creator ekonomisi özet */}
        {economy && (
          <div className="st-block">
            <div className="st-block-header">
              <div className="st-block-title">
                Ekonomi Özeti
              </div>
              <Link href="/studio/economy" className="st-block-link">Detay →</Link>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "var(--st-text)", marginBottom: 6 }}>
                {economy.headline}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--st-text-2)", lineHeight: 1.5, marginBottom: 14 }}>
                {economy.subline}
              </div>
              <Link href="/studio/economy"
                style={{
                  display: "block", textAlign: "center", padding: "8px 14px",
                  borderRadius: 8, background: "var(--st-violet-bg)",
                  border: "1px solid rgba(139,92,246,0.25)", color: "var(--st-violet)",
                  fontSize: 12, fontWeight: 700, textDecoration: "none",
                }}>
                İşletim Merkezi →
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
