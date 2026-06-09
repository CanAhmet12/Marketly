"use client";

import { useId } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { NasdaqPulseMetrics } from "@/features/markets/nasdaq/types";
import { cn } from "@/lib/cn";

type Props = { pulse: NasdaqPulseMetrics };

function fmtIndex(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }
function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)"; if (v < 0) return "var(--cc-rose)"; return "var(--cc-meta)";
}

function MarketMoodGauge({ value, label }: { value: number; label: string }) {
  const id = useId().replace(/:/g, "");
  const r = 20; const cx = 28; const cy = 28;
  const pct = Math.min(100, Math.max(0, value)) / 100;
  const startAngle = Math.PI;
  const endAngle = startAngle - pct * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;
  const color = value >= 60 ? "#06b6d4" : value >= 40 ? "#64748b" : "#ef4444";
  const bandLabel = value >= 70 ? "Risk-On" : value >= 50 ? "Normal" : value >= 30 ? "Temkinli" : "Risk-Off";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="cc-pulse-label">Piyasa Ruh Hali</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="56" height="32" viewBox="0 0 56 32" aria-hidden style={{ overflow: "visible" }}>
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" strokeLinecap="round" />
          {pct > 0 && (
            <path d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`}
              fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
          )}
          <circle cx={x2.toFixed(2)} cy={y2.toFixed(2)} r="3" fill={color} />
        </svg>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 1 }}>{bandLabel}</div>
        </div>
      </div>
    </div>
  );
}

function FedPivotBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="nq-fed-pivot">
      <span className="cc-pulse-label">Fed Pivot</span>
      <div className="nq-fed-value-row">
        <span className="nq-fed-big" style={{ color: "#06b6d4" }}>{value}</span>
        <span className="nq-fed-sub">/100</span>
      </div>
      <div className="nq-fed-bar">
        <div className="nq-fed-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="nq-fed-label">{label}</span>
    </div>
  );
}

export function NasdaqPulseBar({ pulse }: Props) {
  return (
    <div className="cc-pulse-bar-v2" role="region" aria-label="NASDAQ piyasa metrikleri">

      {/* NDX */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--btc" style={{ fontSize: 11, fontWeight: 700 }}>NDX</div>
          <span className="cc-pulse-label">NASDAQ 100</span>
        </div>
        <span className="cc-pulse-value cc-pulse-value--btc">{fmtIndex(pulse.ndx.value)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.ndx.changePct) }}>{signed(pulse.ndx.changePct)}</span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.ndx.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* Composite */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--eth" style={{ fontSize: 11, fontWeight: 700 }}>NAS</div>
          <span className="cc-pulse-label">Composite</span>
        </div>
        <span className="cc-pulse-value">{fmtIndex(pulse.composite.value)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.composite.changePct) }}>{signed(pulse.composite.changePct)}</span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.composite.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* S&P 500 */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">S&P 500</span>
        <span className="cc-pulse-value">{fmtIndex(pulse.sp500.value)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.sp500.changePct) }}>{signed(pulse.sp500.changePct)}</span>
      </div>

      {/* VIX */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">VIX</span>
        <span className="cc-pulse-value" style={{ color: pulse.vix.value < 20 ? "var(--cc-teal)" : pulse.vix.value > 30 ? "var(--cc-rose)" : "var(--cc-text)" }}>
          {pulse.vix.value.toFixed(2)}
        </span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.vix.changePct) }}>{signed(pulse.vix.changePct)}</span>
      </div>

      {/* Toplam Hacim */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">Toplam Hacim</span>
        <span className="cc-pulse-value" style={{ fontSize: 16 }}>{pulse.totalVolume}</span>
      </div>

      {/* Piyasa Ruh Hali */}
      <div className="cc-pulse-cell">
        <MarketMoodGauge value={pulse.marketMood.value} label={pulse.marketMood.label} />
      </div>

      {/* Fed Pivot */}
      <div className="cc-pulse-cell">
        <FedPivotBar value={pulse.fedPivot.value} label={pulse.fedPivot.label} />
      </div>

    </div>
  );
}
