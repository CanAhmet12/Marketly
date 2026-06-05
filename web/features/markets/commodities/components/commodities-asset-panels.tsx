"use client";

import { useId, useMemo } from "react";

import type { CommodityAssetPanel } from "@/features/markets/commodities/types";
import { cn } from "@/lib/cn";

type Props = { altin: CommodityAssetPanel; petrol: CommodityAssetPanel };

function fmtPrice(n: number, unit: string) {
  if (unit === "$/oz" && n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }

function AreaChart({ series, color, height = 140 }: { series: number[]; color: string; height?: number }) {
  const id = useId().replace(/:/g, "");
  const { path, area } = useMemo(() => {
    const w = 300; const h = height; const pad = { x: 2, y: 6 };
    const vals = series.length >= 2 ? series : [0, 0];
    const min = Math.min(...vals); const max = Math.max(...vals);
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

type PanelProps = { panel: CommodityAssetPanel; isAltin: boolean };

function AssetPanel({ panel, isAltin }: PanelProps) {
  const color = isAltin ? "#f97316" : "#ea580c";
  const isUp = panel.changePct >= 0;
  const iconLabel = isAltin ? "Au" : "🛢";

  return (
    <div className={cn("cc-asset-panel block", isAltin ? "cc-asset-panel--btc" : "cc-asset-panel--eth")}>
      <div className="cc-asset-panel-header">
        <div className={cn("cc-asset-logo", isAltin ? "cc-asset-logo--btc" : "cc-asset-logo--eth")}
          style={{ fontSize: isAltin ? 10 : 14, fontWeight: 900 }}>
          {iconLabel}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span className="cc-asset-title">{panel.name.toUpperCase()}</span>
          <span style={{ fontSize: 10, color: "var(--cc-meta)" }}>{panel.unit}</span>
        </div>
      </div>

      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{fmtPrice(panel.price, panel.unit)}</span>
        <span className="cc-asset-change" style={{ color: isUp ? "var(--cc-teal)" : "var(--cc-rose)" }}>
          {signed(panel.changePct)}
        </span>
      </div>

      <div className="cc-asset-stats-row">
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Haftalik</span>
          <span className="cc-asset-stat-value" style={{ color: isAltin ? "var(--cc-teal)" : "var(--cc-rose)" }}>
            {panel.stats.haftalik}
          </span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Aylik</span>
          <span className="cc-asset-stat-value" style={{ color: isAltin ? "var(--cc-teal)" : "var(--cc-rose)" }}>
            {panel.stats.aylik}
          </span>
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
        {["D1", "W1", "M1", "M3", "Y1"].map((tf) => (
          <button key={tf} type="button" className={cn("cc-asset-tf-btn", tf === "D1" && "cc-asset-tf-btn--active")} tabIndex={-1}>
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CommoditiesAssetPanels({ altin, petrol }: Props) {
  return (
    <div className="cc-asset-panels cc-section" role="region" aria-label="Altin ve Petrol panelleri">
      <AssetPanel panel={altin}  isAltin={true} />
      <AssetPanel panel={petrol} isAltin={false} />
    </div>
  );
}
