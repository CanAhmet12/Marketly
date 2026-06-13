"use client";

import type { ReactNode } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { formatNasdaqIndexPrice } from "@/features/markets/nasdaq/lib/nasdaq-pulse-utils";
import {
  exaggerateSpark,
  resolveNasdaqSparkline,
  trendFromSeries,
} from "@/features/markets/nasdaq/lib/nasdaq-sparkline-utils";
import type { NasdaqPulseMetrics } from "@/features/markets/nasdaq/types";
import { cn } from "@/lib/cn";

type Props = { pulse: NasdaqPulseMetrics };

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

function IndexIconLabel({ icon, text, tone }: { icon: string; text: string; tone: "ndx" | "comp" | "spx" | "vix" }) {
  const iconClass =
    tone === "ndx"
      ? "cc-pulse-cell-icon cc-pulse-cell-icon--btc"
      : tone === "comp"
        ? "cc-pulse-cell-icon cc-pulse-cell-icon--eth"
        : cn("nq-pulse-cell-icon", `nq-pulse-cell-icon--${tone}`);

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
  const color = value >= 70 ? "#06b6d4" : value >= 45 ? "rgba(6,182,212,0.75)" : "var(--cc-meta)";
  return (
    <div className="nq-mood-meter">
      <div className="nq-mood-value-row">
        <span className="nq-mood-big" style={{ color }}>
          {value}
        </span>
        <span className="nq-mood-sub">/100</span>
        <span className="nq-mood-label" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="nq-mood-bar">
        <div className="nq-mood-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function FedPivotMeter({ value, label }: { value: number; label: string }) {
  return (
    <div className="nq-fed-pivot nq-fed-pivot--meter">
      <div className="nq-fed-value-row">
        <span className="nq-fed-big">{value}</span>
        <span className="nq-fed-sub">/100</span>
        <span className="nq-fed-label">{label}</span>
      </div>
      <div className="nq-fed-bar">
        <div className="nq-fed-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function NasdaqPulseBar({ pulse }: Props) {
  const ndxSpark = resolveNasdaqSparkline(pulse.ndx.changePct, pulse.ndx.sparkline);
  const compSpark = resolveNasdaqSparkline(pulse.composite.changePct, pulse.composite.sparkline);
  const spxSpark = resolveNasdaqSparkline(pulse.sp500.changePct, pulse.sp500.sparkline);

  return (
    <div className="cc-pulse-bar-v2 nq-pulse-bar-v2" role="region" aria-label="NASDAQ piyasa metrikleri">
      <PulseCell
        label={<IndexIconLabel icon="NDX" text="NASDAQ 100" tone="ndx" />}
        value={formatNasdaqIndexPrice(pulse.ndx.value)}
        valueClass="cc-pulse-value--btc"
        sub={<span className={cn("cc-pulse-change", changeClass(pulse.ndx.changePct))}>{signed(pulse.ndx.changePct)}</span>}
        foot={<PulseSpark series={ndxSpark} trend={trendFromSeries(ndxSpark)} />}
      />

      <PulseCell
        label={<IndexIconLabel icon="NAS" text="COMPOSITE" tone="comp" />}
        value={formatNasdaqIndexPrice(pulse.composite.value)}
        valueClass="cc-pulse-value--eth"
        sub={
          <span className={cn("cc-pulse-change", changeClass(pulse.composite.changePct))}>
            {signed(pulse.composite.changePct)}
          </span>
        }
        foot={<PulseSpark series={compSpark} trend={trendFromSeries(compSpark)} />}
      />

      <PulseCell
        label={<IndexIconLabel icon="SPX" text="S&P 500" tone="spx" />}
        value={formatNasdaqIndexPrice(pulse.sp500.value)}
        sub={
          <span className={cn("cc-pulse-change", changeClass(pulse.sp500.changePct))}>
            {signed(pulse.sp500.changePct)}
          </span>
        }
        foot={<PulseSpark series={spxSpark} trend={trendFromSeries(spxSpark)} />}
      />

      <PulseCell
        label={<IndexIconLabel icon="VIX" text="VIX" tone="vix" />}
        value={pulse.vix.value ? pulse.vix.value.toFixed(2) : "—"}
        sub={
          <span className={cn("cc-pulse-change", changeClass(pulse.vix.changePct))}>
            {signed(pulse.vix.changePct)}
          </span>
        }
      />

      <PulseCell
        label={<span className="cc-pulse-label">Toplam Hacim</span>}
        value={<span className="nq-pulse-volume">{pulse.totalVolume}</span>}
      />

      <PulseCell
        label={<span className="cc-pulse-label">Piyasa Ruh Hali</span>}
        layout="meter"
        value={<MoodMeter value={pulse.marketMood.value} label={pulse.marketMood.label} />}
      />

      <PulseCell
        label={<span className="cc-pulse-label">Fed Pivot</span>}
        layout="meter"
        value={<FedPivotMeter value={pulse.fedPivot.value} label={pulse.fedPivot.label} />}
      />
    </div>
  );
}
