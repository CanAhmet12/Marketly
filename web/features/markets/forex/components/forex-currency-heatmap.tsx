"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import {
  resolvePairSparkline,
  trendFromSeries,
} from "@/features/markets/forex/lib/forex-sparkline-utils";
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
  TRY: "🇹🇷",
};

function heatClass(level: CurrencyHeatLevel): string {
  switch (level) {
    case "strong":
      return "fc-seg-cell--strong";
    case "mild-up":
      return "fc-seg-cell--mild-up";
    case "neutral":
      return "cc-seg-cell--neutral";
    case "mild-down":
      return "fc-seg-cell--mild-down";
    case "weak":
      return "fc-seg-cell--weak";
  }
}

function changeTone(v: number) {
  if (v > 0.3) return "fc-seg-change--strong-up";
  if (v > 0) return "fc-seg-change--up";
  if (v < -0.3) return "fc-seg-change--strong-down";
  if (v < 0) return "fc-seg-change--down";
  return "fc-seg-change--flat";
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function CurrencyCell({ cur }: { cur: CurrencyStrengthItem }) {
  const spark = resolvePairSparkline(cur.changePct, cur.sparkline);
  const trend = trendFromSeries(spark);

  return (
    <div
      className={cn("cc-seg-cell fc-seg-cell", heatClass(cur.heatLevel))}
      title={`${cur.code} — ${cur.name}: ${signed(cur.changePct)}`}
    >
      <div className="cc-seg-header">
        <span className="cc-seg-icon" aria-hidden>
          {CURRENCY_FLAGS[cur.code] ?? "🌐"}
        </span>
        <span className="cc-seg-name">{cur.code}</span>
      </div>
      <span className={cn("cc-seg-change", changeTone(cur.changePct))}>{signed(cur.changePct)}</span>
      <div className="cc-seg-sparkline">
        <MiniSparkline series={spark} trend={trend} height={28} className="w-full" />
      </div>
    </div>
  );
}

export function ForexCurrencyHeatmap({ currencies }: Props) {
  if (!currencies.currencies.length) return null;

  return (
    <div className="cc-section fc-heatmap-section" role="region" aria-label="Para birimi güç haritası">
      <p className="cc-section-label cc-section-label--spaced">Para Birimi Gücü</p>
      <div className="cc-seg-grid fc-seg-grid">
        {currencies.currencies.map((cur) => (
          <CurrencyCell key={cur.code} cur={cur} />
        ))}
      </div>
    </div>
  );
}
