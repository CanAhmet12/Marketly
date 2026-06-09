"use client";

import { useId } from "react";

import type { PortfolioLiveStats } from "@/features/markets/lib/live-richness/build-portfolio-intelligence-from-live";
import { portfolioChartColor } from "@/features/markets/lib/portfolio-visual-tokens";
import { resolvePortfolioMode } from "@/features/markets/lib/portfolio-zone";

type Props = {
  stats: Pick<PortfolioLiveStats, "perfSeries" | "perfMode" | "perfCaption">;
  pageTitle?: string;
};

export function PortfolioPerformanceChart({ stats, pageTitle = "Canlı Portföy" }: Props) {
  const id = useId().replace(/:/g, "");
  const chartColor = portfolioChartColor(resolvePortfolioMode(pageTitle));
  const series = stats.perfSeries;
  const W = 600;
  const H = 120;
  const padX = 8;
  const padY = 8;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => ({
    x: padX + (i / (series.length - 1)) * (W - padX * 2),
    y: padY + (1 - (v - min) / span) * (H - padY * 2),
  }));

  let line = `M ${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1]!.x + pts[i]!.x) / 2;
    line += ` C ${cpx.toFixed(1)} ${pts[i - 1]!.y.toFixed(1)}, ${cpx.toFixed(1)} ${pts[i]!.y.toFixed(1)}, ${pts[i]!.x.toFixed(1)} ${pts[i]!.y.toFixed(1)}`;
  }
  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const area = `${line} L ${last.x.toFixed(1)} ${H} L ${first.x.toFixed(1)} ${H} Z`;

  return (
    <div className="pf-block" data-pf-block-zone="performance">
      <div className="pf-block-header">
        <div className="pf-block-title">
          <span className="pf-block-stripe" />
          Portföy Performansı
        </div>
        {stats.perfMode === "mock_demo" ? (
          <span className="pf-chart-badge pf-chart-badge--demo">Demo veri</span>
        ) : (
          <span className="pf-chart-badge pf-chart-badge--live">Canlı anlık</span>
        )}
      </div>
      <div className="pf-chart-wrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="pf-chart-svg"
          height={H}
          aria-label="Portföy performansı"
        >
          <defs>
            <linearGradient id={`pfg-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#pfg-${id})`} stroke="none" />
          <path
            d={line}
            fill="none"
            stroke={chartColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="pf-chart-line"
          />
        </svg>
        <p className="pf-chart-caption">{stats.perfCaption}</p>
      </div>
    </div>
  );
}
