"use client";

import { useId, useMemo } from "react";

import type { ForexPairPanel } from "@/features/markets/forex/types";
import { cn } from "@/lib/cn";

type Props = { eurusd: ForexPairPanel; gbpusd: ForexPairPanel };

function fmtRate(n: number, pair: string) {
  if (pair.includes("JPY")) return n.toFixed(2);
  return n.toFixed(4);
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function AreaChart({ series, color, height = 140 }: { series: number[]; color: string; height?: number }) {
  const id = useId().replace(/:/g, "");
  const { path, area } = useMemo(() => {
    const w = 300; const h = height; const pad = { x: 2, y: 6 };
    const vals = series.length >= 2 ? series : [0.5, 0.5];
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
    const closedArea = `${line} L ${last.x.toFixed(1)} ${h} L ${first.x.toFixed(1)} ${h} Z`;
    return { path: line, area: closedArea };
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
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 6px ${color}55)` }} />
    </svg>
  );
}

type PanelProps = { panel: ForexPairPanel; isMain: boolean };

function PairPanel({ panel, isMain }: PanelProps) {
  const color = isMain ? "#8b5cf6" : "#6366f1";
  const isUp = panel.changePct >= 0;
  const iconLabel = isMain ? "€/$" : "£/$";

  return (
    <div className={cn("cc-asset-panel block", isMain ? "cc-asset-panel--btc" : "cc-asset-panel--eth")}>
      <div className="cc-asset-panel-header">
        <div className={cn("cc-asset-logo", isMain ? "cc-asset-logo--btc" : "cc-asset-logo--eth")}
          style={{ fontSize: 9, fontWeight: 900 }}>
          {iconLabel}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span className="cc-asset-title">{panel.pair}</span>
          <span style={{ fontSize: 10, color: "var(--cc-meta)" }}>
            Bid {fmtRate(panel.bid, panel.pair)} · Ask {fmtRate(panel.ask, panel.pair)} · Spread {panel.spread.toFixed(1)} pip
          </span>
        </div>
      </div>

      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{fmtRate(panel.rate, panel.pair)}</span>
        <span className="cc-asset-change" style={{ color: isUp ? "var(--cc-teal)" : "var(--cc-rose)" }}>
          {signed(panel.changePct)}
        </span>
      </div>

      <div className="cc-asset-stats-row">
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Gun Yukse</span>
          <span className="cc-asset-stat-value" style={{ color: "var(--cc-teal)" }}>{panel.stats.dayHigh}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Gun Dusuk</span>
          <span className="cc-asset-stat-value" style={{ color: "var(--cc-rose)" }}>{panel.stats.dayLow}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Pip Araligi</span>
          <span className="cc-asset-stat-value">{panel.stats.pipRange} pip</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Haftalik</span>
          <span className="cc-asset-stat-value" style={{ color: "var(--cc-teal)" }}>{panel.stats.weeklyChange}</span>
        </div>
      </div>

      <div className="cc-asset-chart-wrap">
        <div className="cc-asset-chart">
          <AreaChart series={panel.sparkline} color={color} height={140} />
        </div>
      </div>

      <div className="cc-asset-timeframes">
        {["M5", "M15", "H1", "H4", "D1"].map((tf) => (
          <button key={tf} type="button" className={cn("cc-asset-tf-btn", tf === "H1" && "cc-asset-tf-btn--active")} tabIndex={-1}>
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ForexPairPanels({ eurusd, gbpusd }: Props) {
  return (
    <div className="cc-asset-panels cc-section" role="region" aria-label="EUR/USD ve GBP/USD panelleri">
      <PairPanel panel={eurusd} isMain={true} />
      <PairPanel panel={gbpusd} isMain={false} />
    </div>
  );
}
