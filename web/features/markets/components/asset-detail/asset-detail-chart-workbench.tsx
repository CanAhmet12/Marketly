"use client";

import { useId, useMemo, useState } from "react";

import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  accentColor?: string;
};

function AreaChart({
  series,
  color,
  height = 300,
}: {
  series: number[];
  color: string;
  height?: number;
}) {
  const id = useId().replace(/:/g, "");

  const { path, area } = useMemo(() => {
    const w = 300;
    const h = height;
    const pad = { x: 2, y: 8 };
    const vals = series.length >= 2 ? series : Array(14).fill(50).map((v, i) => v + i * 2);
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

  return (
    <svg
      viewBox={`0 0 300 ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      aria-hidden
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`adgrad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#adgrad-${id})`} stroke="none" />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
      />
    </svg>
  );
}

export function AssetDetailChartWorkbench({ bundle, accentColor }: Props) {
  const { asset, chart } = bundle;
  const [tf, setTf] = useState(chart.timeframes[2]?.id ?? "1G");
  const [compare, setCompare] = useState<string | null>(null);

  const color = accentColor ?? "var(--ad-accent, #22c55e)";
  const colorHex = accentColor ?? "#22c55e";

  return (
    <div className="ad-chart-section ad-section">
      <div className="ad-section-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="ad-section-accent" />
          <span className="ad-section-title">Fiyat Grafiği</span>
        </div>
        {/* Timeframe tabs */}
        <div className="ad-tf-row">
          {chart.timeframes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTf(t.id)}
              className={cn("ad-tf-btn", tf === t.id && "ad-tf-btn--active")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div
        className="ad-chart-area"
        style={{
          background: `linear-gradient(180deg, ${colorHex}08 0%, transparent 70%)`,
          borderTop: `2px solid ${colorHex}`,
        }}
      >
        <AreaChart
          series={asset.sparkline ?? []}
          color={colorHex}
          height={300}
        />
      </div>

      {/* Karşılaştırma */}
      {chart.comparisonCandidates.length > 0 && (
        <div className="ad-chart-compare-row">
          <span className="ad-chart-compare-label">Karşılaştır:</span>
          {chart.comparisonCandidates.slice(0, 4).map((c) => (
            <button
              key={c.symbol}
              type="button"
              onClick={() => setCompare(compare === c.symbol ? null : c.symbol)}
              className={cn("ad-compare-btn", compare === c.symbol && "ad-compare-btn--active")}
            >
              {c.symbol}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
