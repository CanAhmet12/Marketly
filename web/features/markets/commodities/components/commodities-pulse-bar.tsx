"use client";

import type { ReactNode } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CommodityPulseMetrics } from "@/features/markets/commodities/types";
import {
  formatCommodityPulsePrice,
} from "@/features/markets/commodities/lib/commodity-pulse-utils";
import {
  exaggerateSpark,
  resolveCommoditySparkline,
  trendFromSeries,
} from "@/features/markets/commodities/lib/commodity-sparkline-utils";
import { cn } from "@/lib/cn";

type Props = { pulse: CommodityPulseMetrics };

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
  subClass?: string;
  foot?: ReactNode;
  className?: string;
  hideSub?: boolean;
  layout?: "default" | "meter";
};

function PulseCell({
  label,
  value,
  valueClass,
  sub,
  subClass,
  foot,
  className,
  hideSub,
  layout = "default",
}: PulseCellProps) {
  const isMeter = layout === "meter";

  return (
    <div className={cn("cc-pulse-cell", isMeter && "cc-pulse-cell--meter", className)}>
      <div className="cc-pulse-cell__top">{label}</div>
      {isMeter ? (
        <div className="cc-pulse-cell__main">{value}</div>
      ) : (
        <div className="cc-pulse-cell__body">
          <div className={cn("cc-pulse-cell__value", valueClass)}>{value}</div>
          {!hideSub ? (
            <div className={cn("cc-pulse-cell__sub", subClass, !sub && "cc-pulse-cell__sub--empty")}>
              {sub ?? "\u00A0"}
            </div>
          ) : null}
        </div>
      )}
      {!isMeter ? (
        <div className="cc-pulse-cell__foot">{foot ?? <span className="cc-pulse-foot-spacer" aria-hidden />}</div>
      ) : null}
    </div>
  );
}

function CommodityIconLabel({
  icon,
  text,
  tone,
}: {
  icon: string;
  text: string;
  tone: "gold" | "silver" | "oil" | "gas" | "copper";
}) {
  const iconClass =
    tone === "gold"
      ? "cc-pulse-cell-icon cc-pulse-cell-icon--btc"
      : tone === "silver"
        ? "cc-pulse-cell-icon cc-pulse-cell-icon--eth"
        : cn("cm-pulse-cell-icon", `cm-pulse-cell-icon--${tone}`);

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

function volatilityTone(value: number): "low" | "mid" | "high" {
  if (value >= 65) return "high";
  if (value >= 38) return "mid";
  return "low";
}

function VolatilityMeter({ value, label }: { value: number; label: string }) {
  const tone = volatilityTone(value);
  const color =
    tone === "high" ? "var(--cc-rose)" : tone === "mid" ? "var(--cc-gold)" : "var(--cc-teal)";

  return (
    <div className="cm-volatility cm-volatility--meter">
      <div className="cm-vol-value-row">
        <span className={cn("cm-vol-big", `cm-vol-big--${tone}`)} style={{ color }}>
          {value}
        </span>
        <span className="cm-vol-sub">/100</span>
        <span className={cn("cm-vol-mode", `cm-vol-mode--${tone}`)} style={{ color }}>
          {label}
        </span>
      </div>
      <div className="cm-vol-bar">
        <div className="cm-vol-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function TrendScoreMeter({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "#f97316" : value >= 45 ? "rgba(249,115,22,0.75)" : "var(--cc-meta)";

  return (
    <div className="cm-trend-score cm-trend-score--meter">
      <div className="cm-trend-value-row">
        <span className="cm-trend-big" style={{ color }}>
          {value}
        </span>
        <span className="cm-trend-sub">/100</span>
        <span className="cm-trend-label" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="cm-trend-bar">
        <div className="cm-trend-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function CommoditiesPulseBar({ pulse }: Props) {
  const altinSpark = resolveCommoditySparkline(pulse.altin.changePct, pulse.altin.sparkline);
  const gumusSpark = resolveCommoditySparkline(pulse.gumus.changePct, pulse.gumus.sparkline);
  const endeksSpark = resolveCommoditySparkline(pulse.endeks.changePct, pulse.endeks.sparkline);

  return (
    <div className="cc-pulse-bar-v2 cm-pulse-bar-v2" role="region" aria-label="Emtia piyasa metrikleri">
      <PulseCell
        label={<CommodityIconLabel icon="Au" text="ALTIN" tone="gold" />}
        value={formatCommodityPulsePrice(pulse.altin.price, pulse.altin.unit)}
        valueClass="cc-pulse-value--btc"
        sub={
          <>
            <span className="cm-pulse-unit">{pulse.altin.unit}</span>
            <span className={cn("cc-pulse-change", changeClass(pulse.altin.changePct))}>
              {signed(pulse.altin.changePct)}
            </span>
          </>
        }
        foot={<PulseSpark series={altinSpark} trend={trendFromSeries(altinSpark)} />}
      />

      <PulseCell
        label={<CommodityIconLabel icon="Ag" text="GÜMÜŞ" tone="silver" />}
        value={formatCommodityPulsePrice(pulse.gumus.price, pulse.gumus.unit)}
        valueClass="cc-pulse-value--eth"
        sub={
          <>
            <span className="cm-pulse-unit">{pulse.gumus.unit}</span>
            <span className={cn("cc-pulse-change", changeClass(pulse.gumus.changePct))}>
              {signed(pulse.gumus.changePct)}
            </span>
          </>
        }
        foot={<PulseSpark series={gumusSpark} trend={trendFromSeries(gumusSpark)} />}
      />

      <PulseCell
        label={<CommodityIconLabel icon="🛢" text="PETROL WTI" tone="oil" />}
        value={formatCommodityPulsePrice(pulse.petrol.price, pulse.petrol.unit)}
        sub={
          <>
            <span className="cm-pulse-unit">{pulse.petrol.unit}</span>
            <span className={cn("cc-pulse-change", changeClass(pulse.petrol.changePct))}>
              {signed(pulse.petrol.changePct)}
            </span>
          </>
        }
      />

      <PulseCell
        label={<span className="cc-pulse-label">DOĞALGAZ</span>}
        value={formatCommodityPulsePrice(pulse.dogalgaz.price, pulse.dogalgaz.unit)}
        sub={
          <>
            <span className="cm-pulse-unit">{pulse.dogalgaz.unit}</span>
            <span className={cn("cc-pulse-change", changeClass(pulse.dogalgaz.changePct))}>
              {signed(pulse.dogalgaz.changePct)}
            </span>
          </>
        }
      />

      <PulseCell
        label={<CommodityIconLabel icon="Cu" text="BAKIR" tone="copper" />}
        value={formatCommodityPulsePrice(pulse.bakir.price, pulse.bakir.unit)}
        sub={
          <>
            <span className="cm-pulse-unit">{pulse.bakir.unit}</span>
            <span className={cn("cc-pulse-change", changeClass(pulse.bakir.changePct))}>
              {signed(pulse.bakir.changePct)}
            </span>
          </>
        }
      />

      <PulseCell
        label={<span className="cc-pulse-label">{pulse.endeks.label}</span>}
        value={pulse.endeks.value.toFixed(1)}
        valueClass="cc-pulse-value--btc"
        sub={
          <span className={cn("cc-pulse-change", changeClass(pulse.endeks.changePct))}>
            {signed(pulse.endeks.changePct)}
          </span>
        }
        foot={<PulseSpark series={endeksSpark} trend={trendFromSeries(endeksSpark)} />}
      />

      <PulseCell
        label={<span className="cc-pulse-label">Emtia Volatilite</span>}
        layout="meter"
        value={<VolatilityMeter value={pulse.volatility.value} label={pulse.volatility.label} />}
      />

      <PulseCell
        label={<span className="cc-pulse-label">Emtia Trendi</span>}
        layout="meter"
        value={<TrendScoreMeter value={pulse.trendScore.value} label={pulse.trendScore.label} />}
      />
    </div>
  );
}
