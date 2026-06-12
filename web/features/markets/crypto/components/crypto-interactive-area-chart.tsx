"use client";

import { useCallback, useId, useMemo, useState, type MouseEvent } from "react";

import { cn } from "@/lib/cn";

export type CryptoChartTimeframe = "1s" | "24s" | "7g" | "30g" | "1y";

const TIMEFRAMES: CryptoChartTimeframe[] = ["1s", "24s", "7g", "30g", "1y"];

export function sliceSeriesForTimeframe(
  series: readonly number[],
  timeframe: CryptoChartTimeframe,
): number[] {
  const base = series.length >= 2 ? [...series] : [50, 50];
  switch (timeframe) {
    case "1s":
      return base.slice(-2);
    case "24s":
      return base.slice(-Math.max(3, Math.ceil(base.length * 0.25)));
    case "7g":
      return base;
    case "30g":
      return base.length >= 4 ? base : [...base, ...base.slice(-2)];
    case "1y":
      return base.length >= 6 ? base : [...base, ...base];
    default:
      return base;
  }
}

type ChartPoint = { x: number; y: number; value: number; index: number };

function buildChartGeometry(series: number[], height: number) {
  const w = 300;
  const h = height;
  const pad = { x: 2, y: 6 };
  const vals = series.length >= 2 ? series : [50, 50];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;

  const pts: ChartPoint[] = vals.map((v, i) => ({
    x: pad.x + (i / (vals.length - 1)) * (w - pad.x * 2),
    y: pad.y + (1 - (v - min) / span) * (h - pad.y * 2),
    value: v,
    index: i,
  }));

  let line = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    line += ` C ${cpx.toFixed(1)} ${pts[i - 1].y.toFixed(1)}, ${cpx.toFixed(1)} ${pts[i].y.toFixed(1)}, ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
  }

  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const closedArea = `${line} L ${lastPt.x.toFixed(1)} ${h} L ${firstPt.x.toFixed(1)} ${h} Z`;

  return { path: line, area: closedArea, pts, w, h };
}

type Props = {
  series: readonly number[];
  color: string;
  height?: number;
  defaultTimeframe?: CryptoChartTimeframe;
  onTimeframeChange?: (tf: CryptoChartTimeframe) => void;
  className?: string;
};

export function CryptoInteractiveAreaChart({
  series,
  color,
  height = 140,
  defaultTimeframe = "7g",
  onTimeframeChange,
  className,
}: Props) {
  const id = useId().replace(/:/g, "");
  const [timeframe, setTimeframe] = useState<CryptoChartTimeframe>(defaultTimeframe);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const sliced = useMemo(() => sliceSeriesForTimeframe(series, timeframe), [series, timeframe]);
  const { path, area, pts, w, h } = useMemo(
    () => buildChartGeometry(sliced, height),
    [sliced, height],
  );

  const handleTf = useCallback(
    (tf: CryptoChartTimeframe) => {
      setTimeframe(tf);
      setHoverIndex(null);
      onTimeframeChange?.(tf);
    },
    [onTimeframeChange],
  );

  const handleMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const x = ratio * w;
      let nearest = 0;
      let minDist = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const dist = Math.abs(pts[i].x - x);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }
      setHoverIndex(nearest);
    },
    [pts, w],
  );

  const hoverPt = hoverIndex != null ? pts[hoverIndex] : null;

  return (
    <div className={cn("cc-interactive-chart", className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        aria-hidden
        className="cc-interactive-chart-svg"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`ccgrad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#ccgrad-${id})`} stroke="none" />
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
        {hoverPt ? (
          <>
            <line
              x1={hoverPt.x}
              x2={hoverPt.x}
              y1={0}
              y2={h}
              stroke={color}
              strokeOpacity="0.35"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={hoverPt.x}
              cy={hoverPt.y}
              r="3.5"
              fill={color}
              stroke="var(--cc-bg)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
      </svg>

      {hoverPt ? (
        <div
          className="cc-interactive-chart-tooltip"
          style={{ left: `${(hoverPt.x / w) * 100}%` }}
        >
          {hoverPt.value.toFixed(2)}
        </div>
      ) : null}

      <div className="cc-asset-timeframes" role="group" aria-label="Grafik zaman aralığı">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            className={cn("cc-asset-tf-btn", timeframe === tf && "cc-asset-tf-btn--active")}
            aria-pressed={timeframe === tf}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTf(tf);
            }}
          >
            {tf.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
