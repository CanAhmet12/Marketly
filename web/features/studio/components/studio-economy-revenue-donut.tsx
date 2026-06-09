"use client";

import { useId } from "react";

import type { StudioEconomyRevenueSegment } from "@/features/studio/repository/types";

type Props = {
  segments: StudioEconomyRevenueSegment[];
};

export function StudioEconomyRevenueDonut({ segments }: Props) {
  const id = useId().replace(/:/g, "");
  const cx = 80;
  const cy = 80;
  const outerR = 70;
  const innerR = 48;
  const total = segments.reduce((s, seg) => s + seg.pct, 0) || 100;

  function polar(r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(s: number, e: number): string {
    const os = polar(outerR, s);
    const oe = polar(outerR, e);
    const is = polar(innerR, e);
    const ie = polar(innerR, s);
    const lg = e - s > 180 ? 1 : 0;
    return `M ${os.x.toFixed(2)} ${os.y.toFixed(2)} A ${outerR} ${outerR} 0 ${lg} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)} L ${is.x.toFixed(2)} ${is.y.toFixed(2)} A ${innerR} ${innerR} 0 ${lg} 0 ${ie.x.toFixed(2)} ${ie.y.toFixed(2)} Z`;
  }

  const arcs: { path: string; color: string }[] = [];
  let start = 0;
  for (const seg of segments) {
    const sweep = (seg.pct / total) * 360;
    arcs.push({ path: arcPath(start, start + sweep - 0.5), color: seg.color });
    start += sweep;
  }

  return (
    <svg viewBox="0 0 160 160" width={160} height={160} aria-label="Gelir dağılımı">
      <defs>
        <filter id={`st-donut-glow-${id}`}>
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodOpacity="0.25" />
        </filter>
      </defs>
      {arcs.map((arc, i) => (
        <path
          key={i}
          d={arc.path}
          fill={arc.color}
          opacity={0.85}
          filter={`url(#st-donut-glow-${id})`}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-bold)" fill="var(--st-meta)">
        GELİR
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="14" fontFamily="var(--font-bold)" fill="var(--st-amber)">
        Dağılım
      </text>
    </svg>
  );
}
