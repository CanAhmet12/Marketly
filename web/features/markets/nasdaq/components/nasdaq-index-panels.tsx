"use client";

import { useId, useMemo } from "react";

import type { NasdaqIndexPanel } from "@/features/markets/nasdaq/types";
import { cn } from "@/lib/cn";

type Props = { ndx: NasdaqIndexPanel; sp500: NasdaqIndexPanel };

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }

function AreaChart({ series, color, height = 140 }: { series: number[]; color: string; height?: number }) {
  const id = useId().replace(/:/g, "");
  const { path, area } = useMemo(() => {
    const w = 300; const h = height; const pad = { x: 2, y: 6 };
    const vals = series.length >= 2 ? series : [0, 0];
    const min = Math.min(...vals); const max = Math.max(...vals); const span = max - min || 1;
    const pts = vals.map((v, i) => ({
      x: pad.x + (i / (vals.length - 1)) * (w - pad.x * 2),
      y: pad.y + (1 - (v - min) / span) * (h - pad.y * 2),
    }));
    let line = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      line += ` C ${cpx.toFixed(1)} ${pts[i - 1].y.toFixed(1)}, ${cpx.toFixed(1)} ${pts[i].y.toFixed(1)}, ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }
    const last = pts[pts.length - 1]; const first = pts[0];
    return { path: line, area: `${line} L ${last.x.toFixed(1)} ${h} L ${first.x.toFixed(1)} ${h} Z` };
  }, [series, height]);

  return (
    <svg viewBox={`0 0 300 ${height}`} preserveAspectRatio="none" width="100%" height={height} aria-hidden style={{ display: "block" }}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${id})`} stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 6px ${color}55)` }} />
    </svg>
  );
}

type PanelProps = { panel: NasdaqIndexPanel; isNdx: boolean };

function IndexPanel({ panel, isNdx }: PanelProps) {
  const color = isNdx ? "#06b6d4" : "#0891b2";
  const isUp = panel.changePct >= 0;
  const iconLabel = isNdx ? "NDX" : "SPX";

  return (
    <div className={cn("cc-asset-panel block", isNdx ? "cc-asset-panel--btc" : "cc-asset-panel--eth")}>
      <div className="cc-asset-panel-header">
        <div className={cn("cc-asset-logo", isNdx ? "cc-asset-logo--btc" : "cc-asset-logo--eth")}
          style={{ fontSize: 11, fontWeight: 700 }}>{iconLabel}</div>
        <span className="cc-asset-title">{panel.name}</span>
      </div>
      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{panel.value.toLocaleString("en-US")}</span>
        <span className="cc-asset-change" style={{ color: isUp ? "var(--cc-teal)" : "var(--cc-rose)" }}>
          {signed(panel.changePct)}
        </span>
      </div>
      <div className="cc-asset-stats-row">
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Haftalik</span>
          <span className="cc-asset-stat-value" style={{ color: "var(--cc-teal)" }}>{panel.stats.haftalik}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Aylik</span>
          <span className="cc-asset-stat-value" style={{ color: "var(--cc-teal)" }}>{panel.stats.aylik}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Destek</span>
          <span className="cc-asset-stat-value">{panel.stats.destek}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Direnc</span>
          <span className="cc-asset-stat-value">{panel.stats.direnc}</span>
        </div>
      </div>
      <div className="cc-asset-chart-wrap">
        <div className="cc-asset-chart">
          <AreaChart series={panel.sparkline} color={color} height={140} />
        </div>
      </div>
      <div className="cc-asset-timeframes">
        {["1G", "1H", "1A", "3A", "YTD"].map((tf) => (
          <button key={tf} type="button" className={cn("cc-asset-tf-btn", tf === "1G" && "cc-asset-tf-btn--active")} tabIndex={-1}>{tf}</button>
        ))}
      </div>
    </div>
  );
}

export function NasdaqIndexPanels({ ndx, sp500 }: Props) {
  return (
    <div className="cc-asset-panels cc-section" role="region" aria-label="NASDAQ 100 ve S&P 500 panelleri">
      <IndexPanel panel={ndx}   isNdx={true} />
      <IndexPanel panel={sp500} isNdx={false} />
    </div>
  );
}
