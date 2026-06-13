"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  formatChartPrice,
  formatChartTime,
  resampleNormalizedSeries,
} from "@/features/markets/crypto/detail/lib/crypto-chart-utils";
import type { CryptoChartCandle } from "@/features/markets/crypto/detail/lib/crypto-chart-types";
import { cn } from "@/lib/cn";

type Props = {
  candles: readonly CryptoChartCandle[];
  compareCandles?: readonly CryptoChartCandle[];
  compareSymbol?: string | null;
  days: number;
  height?: number;
  loading?: boolean;
  featured?: boolean;
};

const PAD = { top: 12, right: 12, bottom: 8, left: 56 };
const VOL_H = 52;

export function CryptoDetailCandleChart({
  candles,
  compareCandles = [],
  compareSymbol,
  days,
  height = 360,
  loading,
  featured = false,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? 640;
      if (w > 0) setWidth(w);
    });
    ro.observe(node);
    setWidth(node.clientWidth || 640);
    return () => ro.disconnect();
  }, []);

  const chartH = height - VOL_H - PAD.top - PAD.bottom;
  const innerW = Math.max(120, width - PAD.left - PAD.right);

  const layout = useMemo(() => {
    if (!candles.length) {
      return {
        min: 0,
        max: 1,
        maxVol: 1,
        candleW: 6,
        gap: 2,
        comparePath: "",
        pricePath: "",
        volBars: [] as { x: number; h: number; up: boolean }[],
        wicks: [] as { x: number; y1: number; y2: number; up: boolean }[],
        bodies: [] as { x: number; y: number; w: number; h: number; up: boolean }[],
        yTicks: [] as { y: number; label: string }[],
      };
    }

    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    let min = Math.min(...lows);
    let max = Math.max(...highs);

    if (compareCandles.length && compareSymbol) {
      const norm = resampleNormalizedSeries(candles, compareCandles);
      const base = candles[0]!.close || 1;
      for (const pct of norm) {
        const px = base * (1 + pct / 100);
        min = Math.min(min, px);
        max = Math.max(max, px);
      }
    }

    const padY = (max - min) * 0.08 || max * 0.02 || 1;
    min -= padY;
    max += padY;
    const span = max - min || 1;

    const count = candles.length;
    const gap = count > 120 ? 1 : count > 60 ? 2 : 3;
    const candleW = Math.max(2, Math.min(14, (innerW - gap * (count - 1)) / count));

    const toY = (price: number) => PAD.top + (1 - (price - min) / span) * chartH;

    const wicks: { x: number; y1: number; y2: number; up: boolean }[] = [];
    const bodies: { x: number; y: number; w: number; h: number; up: boolean }[] = [];
    const volBars: { x: number; h: number; up: boolean }[] = [];

    const volMax = Math.max(...candles.map((c) => c.volume), 1);
    const volBaseY = PAD.top + chartH + VOL_H;

    candles.forEach((c, i) => {
      const x = PAD.left + i * (candleW + gap);
      const cx = x + candleW / 2;
      const up = c.close >= c.open;
      const yHigh = toY(c.high);
      const yLow = toY(c.low);
      const yOpen = toY(c.open);
      const yClose = toY(c.close);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(Math.abs(yClose - yOpen), 1.2);

      wicks.push({ x: cx, y1: yHigh, y2: yLow, up });
      bodies.push({ x, y: bodyTop, w: candleW, h: bodyH, up });

      const vh = c.volume > 0 ? (c.volume / volMax) * (VOL_H - 8) : 0;
      volBars.push({ x, h: vh, up });
    });

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const price = min + span * (1 - t);
      return { y: PAD.top + t * chartH, label: formatChartPrice(price) };
    });

    let comparePath = "";
    if (compareCandles.length && compareSymbol) {
      const norm = resampleNormalizedSeries(candles, compareCandles);
      const base = candles[0]!.close || 1;
      comparePath = norm
        .map((pct, i) => {
          const px = base * (1 + pct / 100);
          const x = PAD.left + i * (candleW + gap) + candleW / 2;
          const y = toY(px);
          return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ");
    }

    return {
      min,
      max,
      maxVol: volMax,
      candleW,
      gap,
      comparePath,
      volBars,
      wicks,
      bodies,
      yTicks,
    };
  }, [candles, compareCandles, compareSymbol, chartH, innerW]);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!candles.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - PAD.left;
    const step = layout.candleW + layout.gap;
    const idx = Math.floor(x / step);
    if (idx >= 0 && idx < candles.length) setHoverIdx(idx);
    else setHoverIdx(null);
  };

  const hover = hoverIdx != null ? candles[hoverIdx] : null;

  return (
    <div
      ref={wrapRef}
      className={cn("cd-chart-viewport", featured && "cd-chart-viewport--featured")}
      style={{ minHeight: height }}
    >
      {loading ? <div className="cd-chart-loading" aria-hidden /> : null}

      <svg
        width={width}
        height={height}
        className={cn("cd-chart-svg", loading && "cd-chart-svg--loading")}
        role="img"
        aria-label="Fiyat mum grafiği"
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={`cd-vol-up-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cc-teal, #10b981)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--cc-teal, #10b981)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={`cd-vol-down-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cc-rose, #ef4444)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--cc-rose, #ef4444)" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {layout.yTicks.map((tick) => (
          <g key={tick.label}>
            <line
              x1={PAD.left}
              y1={tick.y}
              x2={width - PAD.right}
              y2={tick.y}
              stroke="color-mix(in srgb, var(--cd-text) 8%, transparent)"
              strokeDasharray="4 6"
            />
            <text
              x={PAD.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="cd-chart-axis-label"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Volume */}
        {layout.volBars.map((bar, i) => {
          const x = PAD.left + i * (layout.candleW + layout.gap);
          const y = PAD.top + chartH + VOL_H - bar.h;
          return (
            <rect
              key={`v-${i}`}
              x={x}
              y={y}
              width={layout.candleW}
              height={bar.h}
              rx={1}
              fill={bar.up ? `url(#cd-vol-up-${uid})` : `url(#cd-vol-down-${uid})`}
            />
          );
        })}

        {/* Wicks + bodies */}
        {layout.wicks.map((w, i) => (
          <line
            key={`w-${i}`}
            x1={w.x}
            y1={w.y1}
            x2={w.x}
            y2={w.y2}
            stroke={w.up ? "var(--cc-teal, #10b981)" : "var(--cc-rose, #ef4444)"}
            strokeWidth={1}
            opacity={0.85}
          />
        ))}
        {layout.bodies.map((b, i) => (
          <rect
            key={`b-${i}`}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={Math.min(2, b.w / 3)}
            fill={b.up ? "var(--cc-teal, #10b981)" : "var(--cc-rose, #ef4444)"}
            opacity={hoverIdx === i ? 1 : 0.92}
          />
        ))}

        {/* Compare overlay */}
        {layout.comparePath ? (
          <path
            d={layout.comparePath}
            fill="none"
            stroke="var(--cc-violet, #a78bfa)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
        ) : null}

        {/* Crosshair */}
        {hoverIdx != null && hover ? (
          <g>
            <line
              x1={PAD.left + hoverIdx * (layout.candleW + layout.gap) + layout.candleW / 2}
              y1={PAD.top}
              x2={PAD.left + hoverIdx * (layout.candleW + layout.gap) + layout.candleW / 2}
              y2={PAD.top + chartH + VOL_H}
              stroke="color-mix(in srgb, var(--cd-accent) 45%, transparent)"
              strokeDasharray="3 4"
            />
          </g>
        ) : null}
      </svg>

      {hover ? (
        <div className="cd-chart-tooltip" role="status">
          <span className="cd-chart-tooltip-time">{formatChartTime(hover.timestamp, days)}</span>
          <span className="cd-chart-tooltip-ohlc">
            <em>O</em> {formatChartPrice(hover.open)}
          </span>
          <span className="cd-chart-tooltip-ohlc cd-chart-tooltip-ohlc--up">
            <em>H</em> {formatChartPrice(hover.high)}
          </span>
          <span className="cd-chart-tooltip-ohlc cd-chart-tooltip-ohlc--down">
            <em>L</em> {formatChartPrice(hover.low)}
          </span>
          <span className="cd-chart-tooltip-ohlc">
            <em>C</em> {formatChartPrice(hover.close)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
