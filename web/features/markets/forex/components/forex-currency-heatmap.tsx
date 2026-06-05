"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CurrencyHeatLevel, CurrencyStrengthItem, ForexCurrencyHeatmapPayload } from "@/features/markets/forex/types";
import { cn } from "@/lib/cn";

type Props = { currencies: ForexCurrencyHeatmapPayload };

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CHF: "🇨🇭",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CAD: "🇨🇦",
};

function borderColor(level: CurrencyHeatLevel): string {
  switch (level) {
    case "strong":    return "#8b5cf6";
    case "mild-up":   return "rgba(139,92,246,0.4)";
    case "neutral":   return "var(--cc-border)";
    case "mild-down": return "rgba(239,68,68,0.4)";
    case "weak":      return "var(--cc-rose)";
  }
}

function changeColor(v: number): string {
  if (v > 0.3)  return "#8b5cf6";
  if (v > 0)    return "rgba(139,92,246,0.7)";
  if (v < -0.3) return "var(--cc-rose)";
  if (v < 0)    return "rgba(239,68,68,0.7)";
  return "var(--cc-meta)";
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function CurrencyCell({ cur }: { cur: CurrencyStrengthItem }) {
  const trend = cur.changePct > 0 ? "up" : cur.changePct < 0 ? "down" : "flat";
  return (
    <div
      className="cc-seg-cell"
      style={{ borderLeftColor: borderColor(cur.heatLevel) }}
      title={`${cur.code} — ${cur.name}: ${signed(cur.changePct)}`}
    >
      <div className="cc-seg-header">
        <span className="cc-seg-icon" aria-hidden>{CURRENCY_FLAGS[cur.code] ?? "🌐"}</span>
        <span className="cc-seg-name">{cur.code}</span>
      </div>
      <span className="cc-seg-change" style={{ color: changeColor(cur.changePct) }}>
        {signed(cur.changePct)}
      </span>
      <div className="cc-seg-sparkline">
        <MiniSparkline series={cur.sparkline} trend={trend} height={36} className="w-full" />
      </div>
    </div>
  );
}

export function ForexCurrencyHeatmap({ currencies }: Props) {
  return (
    <div className="cc-section" role="region" aria-label="Para birimi guc haritasi">
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Para Birimi Gucu</p>
      <div className="fc-currency-grid">
        {currencies.currencies.map((cur) => (
          <CurrencyCell key={cur.code} cur={cur} />
        ))}
      </div>
    </div>
  );
}
