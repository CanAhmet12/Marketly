"use client";

import type { ReactNode } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import {
  exaggerateSpark,
  resolvePairSparkline,
  trendFromSeries,
} from "@/features/markets/forex/lib/forex-sparkline-utils";
import type { ForexPulseMetrics, ForexSession } from "@/features/markets/forex/types";
import { cn } from "@/lib/cn";

type Props = { pulse: ForexPulseMetrics };

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeClass(v: number) {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "cc-neutral";
}

function fmtRate(n: number, pair: string) {
  if (!n) return "—";
  return formatForexTickerPrice(n, pair.replace("/", ""));
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

type PairTone = "eur" | "gbp" | "try" | "jpy" | "dxy";

function PairIconLabel({
  icon,
  text,
  tone,
}: {
  icon: string;
  text: string;
  tone: PairTone;
}) {
  const iconClass =
    tone === "eur"
      ? "cc-pulse-cell-icon cc-pulse-cell-icon--btc"
      : tone === "gbp"
        ? "cc-pulse-cell-icon cc-pulse-cell-icon--eth"
        : cn("fc-pulse-cell-icon", `fc-pulse-cell-icon--${tone}`);

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

const SESSION_STATUS_LABEL: Record<ForexSession["status"], string> = {
  active: "Açık",
  soon: "Yaklaşıyor",
  closed: "Kapalı",
};

function SessionsMeter({ sessions }: { sessions: ForexSession[] }) {
  if (!sessions.length) {
    return <span className="fc-pulse-empty">Seans verisi yok</span>;
  }

  return (
    <div className="fc-sessions fc-sessions--meter">
      {sessions.map((s) => (
        <div key={s.name} className="fc-session-row">
          <span
            className={cn(
              "fc-session-dot",
              s.status === "active" && "fc-session-dot--active",
              s.status === "soon" && "fc-session-dot--soon",
              s.status === "closed" && "fc-session-dot--closed",
            )}
            aria-hidden
          />
          <span className={cn("fc-session-label", s.status === "active" && "fc-session-label--active")}>
            {s.label}
          </span>
          <span className="fc-session-time">{SESSION_STATUS_LABEL[s.status]}</span>
        </div>
      ))}
    </div>
  );
}

function volatilityTone(value: number): "low" | "mid" | "high" {
  if (value >= 65) return "high";
  if (value >= 35) return "mid";
  return "low";
}

function VolatilityMeter({ value, label }: { value: number; label: string }) {
  const tone = volatilityTone(value);
  const color =
    tone === "high" ? "var(--cc-rose)" : tone === "mid" ? "var(--cc-gold)" : "var(--cc-teal)";

  return (
    <div className="fc-volatility fc-volatility--meter">
      <div className="fc-vol-value-row">
        <span className={cn("fc-vol-big", `fc-vol-big--${tone}`)} style={{ color }}>
          {value}
        </span>
        <span className="fc-vol-sub">/100</span>
        <span className={cn("fc-vol-mode", `fc-vol-mode--${tone}`)} style={{ color }}>
          {label}
        </span>
      </div>
      <div className="fc-vol-bar">
        <div className="fc-vol-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function ForexPulseBar({ pulse }: Props) {
  const eurSpark = resolvePairSparkline(pulse.eurusd.changePct, pulse.eurusd.sparkline);
  const gbpSpark = resolvePairSparkline(pulse.gbpusd.changePct, pulse.gbpusd.sparkline);
  const trySpark = resolvePairSparkline(pulse.usdtry.changePct, pulse.usdtry.sparkline);
  const jpySpark = resolvePairSparkline(pulse.usdjpy.changePct, pulse.usdjpy.sparkline);
  const dxySpark = resolvePairSparkline(pulse.dxy.changePct, pulse.dxy.sparkline);

  return (
    <div className="cc-pulse-bar-v2 fc-pulse-bar-v2" role="region" aria-label="Forex piyasa metrikleri">
      <PulseCell
        label={<PairIconLabel icon="€/$" text="EUR/USD" tone="eur" />}
        value={fmtRate(pulse.eurusd.rate, pulse.eurusd.pair)}
        valueClass="cc-pulse-value--btc"
        sub={
          <span className={cn("cc-pulse-change", changeClass(pulse.eurusd.changePct))}>
            {signed(pulse.eurusd.changePct)}
          </span>
        }
        foot={<PulseSpark series={eurSpark} trend={trendFromSeries(eurSpark)} />}
      />

      <PulseCell
        label={<PairIconLabel icon="£/$" text="GBP/USD" tone="gbp" />}
        value={fmtRate(pulse.gbpusd.rate, pulse.gbpusd.pair)}
        valueClass="cc-pulse-value--eth"
        sub={
          <span className={cn("cc-pulse-change", changeClass(pulse.gbpusd.changePct))}>
            {signed(pulse.gbpusd.changePct)}
          </span>
        }
        foot={<PulseSpark series={gbpSpark} trend={trendFromSeries(gbpSpark)} />}
      />

      <PulseCell
        label={<PairIconLabel icon="₺" text="USD/TRY" tone="try" />}
        value={fmtRate(pulse.usdtry.rate, pulse.usdtry.pair)}
        sub={
          pulse.usdtry.rate ? (
            <span className={cn("cc-pulse-change", changeClass(pulse.usdtry.changePct))}>
              {signed(pulse.usdtry.changePct)}
            </span>
          ) : (
            <span className="cc-pulse-change cc-neutral">—</span>
          )
        }
        hideSub={!pulse.usdtry.rate}
        foot={pulse.usdtry.rate ? <PulseSpark series={trySpark} trend={trendFromSeries(trySpark)} /> : undefined}
      />

      <PulseCell
        label={<PairIconLabel icon="¥" text="USD/JPY" tone="jpy" />}
        value={fmtRate(pulse.usdjpy.rate, pulse.usdjpy.pair)}
        sub={
          pulse.usdjpy.rate ? (
            <span className={cn("cc-pulse-change", changeClass(pulse.usdjpy.changePct))}>
              {signed(pulse.usdjpy.changePct)}
            </span>
          ) : (
            <span className="cc-pulse-change cc-neutral">—</span>
          )
        }
        hideSub={!pulse.usdjpy.rate}
        foot={pulse.usdjpy.rate ? <PulseSpark series={jpySpark} trend={trendFromSeries(jpySpark)} /> : undefined}
      />

      <PulseCell
        label={<PairIconLabel icon="DX" text="DXY Endeksi" tone="dxy" />}
        value={pulse.dxy.value > 0 ? pulse.dxy.value.toFixed(2) : "—"}
        valueClass="cc-pulse-value--btc"
        sub={
          <span className={cn("cc-pulse-change", changeClass(pulse.dxy.changePct))}>
            {signed(pulse.dxy.changePct)}
          </span>
        }
        foot={<PulseSpark series={dxySpark} trend={trendFromSeries(dxySpark)} />}
      />

      <PulseCell
        label={<span className="cc-pulse-label">Aktif Seans</span>}
        value={<SessionsMeter sessions={pulse.sessions} />}
        layout="meter"
      />

      <PulseCell
        label={<span className="cc-pulse-label">FX Volatilite</span>}
        value={<VolatilityMeter value={pulse.volatility.value} label={pulse.volatility.label} />}
        layout="meter"
        className="cc-pulse-cell--last"
      />
    </div>
  );
}
