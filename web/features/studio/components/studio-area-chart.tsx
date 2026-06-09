"use client";

import { useId } from "react";

type Point = { label: string; value: number };

type Props = {
  series: Point[];
  color?: string;
  label: string;
  height?: number;
};

/** Dashboard + analytics paylaşımlı alan grafiği */
export function StudioAreaChart({ series, color = "var(--st-chart-views)", label, height = 120 }: Props) {
  const id = useId().replace(/:/g, "");
  const W = 500;
  const H = height;
  const padX = 8;
  const padY = 10;

  if (series.length === 0) {
    return (
      <div className="st-chart-empty" style={{ height: H }} aria-label={label}>
        Veri yok
      </div>
    );
  }

  const vals = series.map((s) => s.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const pts = vals.map((v, i) => ({
    x: padX + (i / Math.max(1, vals.length - 1)) * (W - padX * 2),
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
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      width="100%"
      height={H}
      className="st-chart-svg"
      style={{ color }}
      aria-label={label}
    >
      <defs>
        <linearGradient id={`stg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#stg-${id})`} stroke="none" />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="st-chart-line"
      />
    </svg>
  );
}
