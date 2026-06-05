"use client";

import { useId, useMemo } from "react";

import type { BistIndexPanel } from "@/features/markets/bist/types";
import { cn } from "@/lib/cn";

type Props = {
  bist100: BistIndexPanel;
  bist30:  BistIndexPanel;
};

function fmtIndex(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function AreaChart({ series, color, height = 140 }: { series: number[]; color: string; height?: number }) {
  const { path, area } = useMemo(() => {
    const w = 300;
    const h = height;
    const pad = { x: 2, y: 6 };
    const vals = series.length >= 2 ? series : [50, 50];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const pts = vals.map((v, i) => ({
      x: pad.x + (i / (vals.length - 1)) * (w - pad.x * 2),
      y: pad.y + (1 - (v - min) / span) * (h - pad.y * 2),
    }));
    let line = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      line += ` C ${cpx.toFixed(1)} ${pts[i - 1].y.toFixed(1)}, ${cpx.toFixed(1)} ${pts[i].y.toFixed(1)}, ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    const first = pts[0];
    const closedArea = `${line} L ${last.x.toFixed(1)} ${h} L ${first.x.toFixed(1)} ${h} Z`;
    return { path: line, area: closedArea };
  }, [series, height]);

  const id = useId().replace(/:/g, "");

  return (
    <svg viewBox={`0 0 300 ${height}`} preserveAspectRatio="none" width="100%" height={height} aria-hidden style={{ display: "block" }}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${id})`} stroke="none" />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
      />
    </svg>
  );
}

type PanelProps = { panel: BistIndexPanel; isBist100: boolean };

function IndexPanel({ panel, isBist100 }: PanelProps) {
  const color = isBist100 ? "#3b82f6" : "#60a5fa";
  const isUp = panel.changePercent >= 0;

  return (
    <div className={cn("cc-asset-panel block", isBist100 ? "cc-asset-panel--btc" : "cc-asset-panel--eth")}>
      <div className="cc-asset-panel-header">
        <div className={cn("cc-asset-logo", isBist100 ? "cc-asset-logo--btc" : "cc-asset-logo--eth")}
          style={{ fontSize: 9, fontWeight: 900 }}>
          {isBist100 ? "B100" : "B30"}
        </div>
        <span className="cc-asset-title">
          {panel.name} <span style={{ color: "var(--cc-meta)", fontWeight: 500 }}>BIST</span>
        </span>
      </div>

      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{fmtIndex(panel.value)}</span>
        <span className="cc-asset-change" style={{ color: isUp ? "var(--cc-teal)" : "var(--cc-rose)" }}>
          {signed(panel.changePercent)}
        </span>
      </div>

      <div className="cc-asset-stats-row">
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Piyasa Degeri</span>
          <span className="cc-asset-stat-value">{panel.stats.marketCap}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Hacim</span>
          <span className="cc-asset-stat-value">{panel.stats.volume}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Gun Yukse</span>
          <span className="cc-asset-stat-value" style={{ color: "var(--cc-teal)" }}>{panel.stats.highDay}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Gun Dusuk</span>
          <span className="cc-asset-stat-value" style={{ color: "var(--cc-rose)" }}>{panel.stats.lowDay}</span>
        </div>
      </div>

      <div className="cc-asset-chart-wrap">
        <div className="cc-asset-chart">
          <AreaChart series={panel.sparkline} color={color} height={140} />
        </div>
      </div>

      <div className="cc-asset-timeframes">
        {["Gun", "1H", "1A", "3A", "1Y"].map((tf) => (
          <button
            key={tf}
            type="button"
            className={cn("cc-asset-tf-btn", tf === "Gun" && "cc-asset-tf-btn--active")}
            tabIndex={-1}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BistIndexPanels({ bist100, bist30 }: Props) {
  return (
    <div className="cc-asset-panels cc-section" role="region" aria-label="BIST 100 ve BIST 30 panelleri">
      <IndexPanel panel={bist100} isBist100={true} />
      <IndexPanel panel={bist30}  isBist100={false} />
    </div>
  );
}
