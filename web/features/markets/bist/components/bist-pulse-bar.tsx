"use client";

import type { ReactNode } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { formatBistIndexPrice } from "@/features/markets/bist/lib/bist-pulse-utils";
import {
  exaggerateSpark,
  resolveBistSparkline,
  trendFromSeries,
} from "@/features/markets/bist/lib/bist-sparkline-utils";
import type { BistPulseMetrics } from "@/features/markets/bist/types";
import { cn } from "@/lib/cn";

type Props = { pulse: BistPulseMetrics };

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeClass(v: number) {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "cc-neutral";
}

type PulseCellProps = {
  label: ReactNode;
  value: ReactNode;
  valueClass?: string;
  sub?: ReactNode;
  foot?: ReactNode;
  layout?: "default" | "meter";
};

function PulseCell({ label, value, valueClass, sub, foot, layout = "default" }: PulseCellProps) {
  const isMeter = layout === "meter";
  return (
    <div className={cn("cc-pulse-cell", isMeter && "cc-pulse-cell--meter")}>
      <div className="cc-pulse-cell__top">{label}</div>
      {isMeter ? (
        <div className="cc-pulse-cell__main">{value}</div>
      ) : (
        <div className="cc-pulse-cell__body">
          <div className={cn("cc-pulse-cell__value", valueClass)}>{value}</div>
          <div className={cn("cc-pulse-cell__sub", !sub && "cc-pulse-cell__sub--empty")}>{sub ?? "\u00A0"}</div>
        </div>
      )}
      {!isMeter ? (
        <div className="cc-pulse-cell__foot">{foot ?? <span className="cc-pulse-foot-spacer" aria-hidden />}</div>
      ) : null}
    </div>
  );
}

function IndexIconLabel({ icon, text, tone }: { icon: string; text: string; tone: "b100" | "b30" | "bank" | "sin" }) {
  const iconClass =
    tone === "b100"
      ? "cc-pulse-cell-icon cc-pulse-cell-icon--btc"
      : tone === "b30"
        ? "cc-pulse-cell-icon cc-pulse-cell-icon--eth"
        : cn("bc-pulse-cell-icon", `bc-pulse-cell-icon--${tone}`);

  return (
    <div className="cc-pulse-cell-header">
      <div className={iconClass}>{icon}</div>
      <span className="cc-pulse-label">{text}</span>
    </div>
  );
}

function PulseSpark({ series, trend }: { series: number[]; trend: "up" | "down" | "flat" }) {
  const boosted = exaggerateSpark(series);
  return (
    <div className="cc-pulse-spark-wrap">
      <MiniSparkline series={boosted} trend={trend} height={34} className="cc-pulse-spark" />
    </div>
  );
}

function MoodMeter({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "#3b82f6" : value >= 45 ? "rgba(59,130,246,0.75)" : "var(--cc-meta)";
  return (
    <div className="bc-mood-meter">
      <div className="bc-mood-value-row">
        <span className="bc-mood-big" style={{ color }}>
          {value}
        </span>
        <span className="bc-mood-sub">/100</span>
        <span className="bc-mood-label" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="bc-mood-bar">
        <div className="bc-mood-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function ForeignRatioMeter({ value, change }: { value: number; change: number }) {
  return (
    <div className="bc-foreign-meter">
      <div className="bc-foreign-value-row">
        <span className="bc-foreign-big">{value.toFixed(2)}</span>
        <span className="bc-foreign-sub">%</span>
        <span className={cn("bc-foreign-delta", changeClass(change))}>
          {change > 0 ? "+" : ""}
          {change.toFixed(2)} puan
        </span>
      </div>
      <div className="bc-foreign-bar">
        <div className="bc-foreign-fill" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

export function BistPulseBar({ pulse }: Props) {
  const indices = [
    { item: pulse.bist100, tone: "b100" as const, icon: "100", label: "BIST 100", valueClass: "cc-pulse-value--btc" },
    { item: pulse.bist30, tone: "b30" as const, icon: "30", label: "BIST 30", valueClass: "cc-pulse-value--eth" },
    { item: pulse.bistBanka, tone: "bank" as const, icon: "BNK", label: "Banka", valueClass: undefined },
    { item: pulse.bistSinai, tone: "sin" as const, icon: "SIN", label: "Sanayi", valueClass: undefined },
  ];

  return (
    <div className="cc-pulse-bar-v2 bc-pulse-bar-v2" role="region" aria-label="BIST piyasa metrikleri">
      {indices.map(({ item, tone, icon, label, valueClass }) => {
        const spark = resolveBistSparkline(item.changePercent, item.sparkline);
        return (
          <PulseCell
            key={label}
            label={<IndexIconLabel icon={icon} text={label} tone={tone} />}
            value={formatBistIndexPrice(item.value)}
            valueClass={valueClass}
            sub={
              <span className={cn("cc-pulse-change", changeClass(item.changePercent))}>
                {signed(item.changePercent)}
              </span>
            }
            foot={<PulseSpark series={spark} trend={trendFromSeries(spark)} />}
          />
        );
      })}

      <PulseCell
        label={<span className="cc-pulse-label">Toplam Hacim</span>}
        value={<span className="bc-pulse-volume">{pulse.toplamHacim}</span>}
      />

      <PulseCell
        label={<span className="cc-pulse-label">Yabancı Oran</span>}
        layout="meter"
        value={<ForeignRatioMeter value={pulse.yabancıOran.value} change={pulse.yabancıOran.change} />}
      />

      <PulseCell
        label={<span className="cc-pulse-label">Piyasa Durumu</span>}
        layout="meter"
        value={<MoodMeter value={pulse.piyasaDurumu.value} label={pulse.piyasaDurumu.label} />}
      />
    </div>
  );
}
