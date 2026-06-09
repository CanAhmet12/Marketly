"use client";

import { useId, useMemo } from "react";

type Props = {
  value: number;
  size?: number;
  direction?: string;
  /** L2 — varsayılan: tez gücü */
  centerLabel?: string;
};

function directionStroke(direction?: string): string | null {
  const d = (direction ?? "").toUpperCase();
  if (d === "BUY") return "var(--sp-buy, var(--color-rise))";
  if (d === "SELL") return "var(--sp-sell, var(--color-fall))";
  if (d === "HOLD") return "var(--sp-hold, var(--color-text-tertiary))";
  return null;
}

/** Tek kaynak güven halkası — feed + modal. */
export function SignalConfidenceRing({ value, size = 64, direction, centerLabel = "tez gücü" }: Props) {
  const uid = useId().replace(/:/g, "");
  const gradId = `sig-conf-${uid}`;
  const clamped = Math.max(0, Math.min(100, value));
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);
  const cx = 40;
  const cy = 40;

  const dirStroke = directionStroke(direction);

  const strokeColor = useMemo(() => {
    if (dirStroke) return dirStroke;
    if (clamped >= 70) return "var(--color-primary)";
    if (clamped >= 50) return "color-mix(in srgb, var(--color-primary) 45%, var(--color-meta))";
    return "var(--color-meta)";
  }, [dirStroke, clamped]);

  const useGradient = !dirStroke && clamped >= 65;
  const valueSize = Math.max(10, Math.round(size * 0.22));
  const labelSize = Math.max(7, Math.round(size * 0.14));

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="shrink-0" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-primary-dark)" />
        </linearGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="color-mix(in srgb, var(--color-border) 65%, transparent)"
        strokeWidth="5"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={useGradient ? `url(#${gradId})` : strokeColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        fill="var(--color-text)"
        fontSize={valueSize}
        fontWeight="700"
        className="tabular-nums"
      >
        {clamped}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="var(--color-meta)"
        fontSize={labelSize}
        fontWeight="650"
      >
        {centerLabel}
      </text>
    </svg>
  );
}
