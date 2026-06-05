"use client";

import { useId, useMemo } from "react";

import { cn } from "@/lib/cn";

type Props = {
  series: number[];
  trend: "up" | "down" | "flat";
  className?: string;
  height?: number;
};

function strokeGlowFilter(trend: "up" | "down" | "flat"): string {
  if (trend === "up") return "drop-shadow(0 0 4px rgba(16, 185, 129, 0.42)) drop-shadow(0 0 10px rgba(16, 185, 129, 0.18))";
  if (trend === "down") return "drop-shadow(0 0 4px rgba(239, 68, 68, 0.42)) drop-shadow(0 0 10px rgba(239, 68, 68, 0.18))";
  return "drop-shadow(0 0 3px rgba(148, 163, 184, 0.28))";
}

export function MiniSparkline({ series, trend, className, height = 40 }: Props) {
  const { d, strokeCss } = useMemo(() => {
    const w = 100;
    const h = height;
    const pad = 3;
    const vals = series.length ? series : [50, 50];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const pts = vals.map((v, i) => {
      const x = pad + (i / Math.max(1, vals.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return { x, y };
    });
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L ${pts[pts.length - 1]?.x ?? w} ${h} L ${pts[0]?.x ?? 0} ${h} Z`;
    const strokeCss = trend === "up" ? "var(--ms-spark-up)" : trend === "down" ? "var(--ms-spark-down)" : "var(--ms-spark-flat)";
    return { d: { line, area }, strokeCss };
  }, [series, trend, height]);

  const gid = `ms-spark-${useId().replace(/:/g, "")}`;
  const lineGlow = strokeGlowFilter(trend);

  return (
    <svg
      className={cn("shrink-0 overflow-visible", className)}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeCss} stopOpacity="0.14" />
          <stop offset="100%" stopColor={strokeCss} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d.area} fill={`url(#${gid})`} stroke="none" />
      <path
        d={d.line}
        fill="none"
        stroke={strokeCss}
        strokeWidth="1.15"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: lineGlow }}
      />
    </svg>
  );
}
