"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { ForexPulseMetrics, ForexSession } from "@/features/markets/forex/types";
import { cn } from "@/lib/cn";

type Props = { pulse: ForexPulseMetrics };

function fmtRate(n: number, pair: string) {
  if (pair.includes("JPY") || pair.includes("TRY")) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)";
  if (v < 0) return "var(--cc-rose)";
  return "var(--cc-meta)";
}

function SessionsCell({ sessions }: { sessions: ForexSession[] }) {
  return (
    <div className="fc-sessions">
      <span className="cc-pulse-label" style={{ marginBottom: 6 }}>Aktif Seans</span>
      {sessions.map((s) => (
        <div key={s.name} className="fc-session-row">
          <span
            className={cn(
              "fc-session-dot",
              s.status === "active" && "fc-session-dot--active",
              s.status === "soon"   && "fc-session-dot--soon",
              s.status === "closed" && "fc-session-dot--closed",
            )}
            aria-hidden
          />
          <span className={cn("fc-session-label", s.status === "active" && "fc-session-label--active")}>
            {s.label}
          </span>
          <span className="fc-session-time">{s.status === "active" ? "Acik" : s.status === "soon" ? "Yaklasıyor" : "Kapali"}</span>
        </div>
      ))}
    </div>
  );
}

function VolatilityCell({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "var(--cc-rose)" : value >= 40 ? "#8b5cf6" : "var(--cc-teal)";
  return (
    <div className="fc-volatility">
      <span className="cc-pulse-label">FX Volatilite</span>
      <div className="fc-vol-value-row">
        <span className="fc-vol-big" style={{ color }}>{value}</span>
        <span className="fc-vol-sub">/100</span>
      </div>
      <div className="fc-vol-bar">
        <div className="fc-vol-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="fc-vol-label" style={{ color }}>{label}</span>
    </div>
  );
}

export function ForexPulseBar({ pulse }: Props) {
  const pairs = [
    { item: pulse.eurusd, isMain: true,  iconLabel: "€/$" },
    { item: pulse.gbpusd, isMain: false, iconLabel: "£/$" },
    { item: pulse.usdtry, isMain: false, iconLabel: null },
    { item: pulse.usdjpy, isMain: false, iconLabel: null },
  ];

  return (
    <div className="cc-pulse-bar-v2" role="region" aria-label="Forex piyasa metrikleri">

      {/* EUR/USD */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--btc" style={{ fontSize: 11, fontWeight: 700 }}>€/$</div>
          <span className="cc-pulse-label">EUR/USD</span>
        </div>
        <span className="cc-pulse-value cc-pulse-value--btc">{fmtRate(pulse.eurusd.rate, "EUR/USD")}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.eurusd.changePct) }}>
          {signed(pulse.eurusd.changePct)}
        </span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.eurusd.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* GBP/USD */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--eth" style={{ fontSize: 11, fontWeight: 700 }}>£/$</div>
          <span className="cc-pulse-label">GBP/USD</span>
        </div>
        <span className="cc-pulse-value">{fmtRate(pulse.gbpusd.rate, "GBP/USD")}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.gbpusd.changePct) }}>
          {signed(pulse.gbpusd.changePct)}
        </span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.gbpusd.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* USD/TRY */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">USD/TRY</span>
        <span className="cc-pulse-value">{fmtRate(pulse.usdtry.rate, "USD/TRY")}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.usdtry.changePct) }}>
          {signed(pulse.usdtry.changePct)}
        </span>
      </div>

      {/* USD/JPY */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">USD/JPY</span>
        <span className="cc-pulse-value">{fmtRate(pulse.usdjpy.rate, "USD/JPY")}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.usdjpy.changePct) }}>
          {signed(pulse.usdjpy.changePct)}
        </span>
      </div>

      {/* DXY */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">DXY Endeksi</span>
        <span className="cc-pulse-value cc-pulse-value--btc">
          {pulse.dxy.value.toFixed(2)}
        </span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.dxy.changePct) }}>
          {signed(pulse.dxy.changePct)}
        </span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.dxy.sparkline} trend="down" height={30} className="w-full" />
        </div>
      </div>

      {/* Aktif Seans */}
      <div className="cc-pulse-cell">
        <SessionsCell sessions={pulse.sessions} />
      </div>

      {/* FX Volatilite */}
      <div className="cc-pulse-cell">
        <VolatilityCell value={pulse.volatility.value} label={pulse.volatility.label} />
      </div>

    </div>
  );
}
