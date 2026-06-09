"use client";

import { useId } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { BistPulseMetrics } from "@/features/markets/bist/types";
import { cn } from "@/lib/cn";

type Props = { pulse: BistPulseMetrics };

function fmtIndex(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)";
  if (v < 0) return "var(--cc-rose)";
  return "var(--cc-meta)";
}

function PiyasaDurumuGauge({ value, label }: { value: number; label: string }) {
  const id = useId().replace(/:/g, "");
  const r = 20;
  const cx = 28;
  const cy = 28;
  const pct = Math.min(100, Math.max(0, value)) / 100;
  const startAngle = Math.PI;
  const endAngle = startAngle - pct * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;
  const color = value >= 60 ? "#3b82f6" : value >= 40 ? "#64748b" : "#ef4444";
  const bandLabel = value >= 70 ? "Yukselis" : value >= 50 ? "Normal Seyir" : value >= 30 ? "Yatay" : "Satis";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="cc-pulse-label">Piyasa Durumu</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="56" height="32" viewBox="0 0 56 32" aria-hidden style={{ overflow: "visible" }}>
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {pct > 0 && (
            <path
              d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`}
              fill="none"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}
          <circle cx={x2.toFixed(2)} cy={y2.toFixed(2)} r="3" fill={color} />
        </svg>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {value}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 1 }}>{bandLabel}</div>
        </div>
      </div>
    </div>
  );
}

function YabancıOranBar({ value, change }: { value: number; change: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="cc-pulse-label">Yabanci Oran</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--cc-text)", fontVariantNumeric: "tabular-nums", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          {value.toFixed(2)}
        </span>
        <span style={{ fontSize: 11, color: "var(--cc-meta)", fontWeight: 600 }}>%</span>
      </div>
      <div style={{ height: 4, width: "100%", borderRadius: 999, background: "var(--cc-border)", overflow: "hidden", marginTop: 2 }}>
        <div style={{ height: "100%", width: `${value}%`, background: "var(--cc-gold)", borderRadius: 999, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: changeColor(change) }}>
        {change > 0 ? "+" : ""}{change.toFixed(2)} puan
      </span>
    </div>
  );
}

export function BistPulseBar({ pulse }: Props) {
  const indices = [
    { label: pulse.bist100.label,   value: pulse.bist100.value,   chg: pulse.bist100.changePercent,   spark: pulse.bist100.sparkline,   isBist100: true },
    { label: pulse.bist30.label,    value: pulse.bist30.value,    chg: pulse.bist30.changePercent,    spark: pulse.bist30.sparkline,    isBist100: false },
    { label: pulse.bistBanka.label, value: pulse.bistBanka.value, chg: pulse.bistBanka.changePercent, spark: pulse.bistBanka.sparkline, isBist100: false },
    { label: pulse.bistSinai.label, value: pulse.bistSinai.value, chg: pulse.bistSinai.changePercent, spark: pulse.bistSinai.sparkline, isBist100: false },
  ];

  return (
    <div className="cc-pulse-bar-v2" role="region" aria-label="BIST piyasa metrikleri">

      {/* BIST 100 */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--btc" style={{ fontWeight: 700, fontSize: 11 }}>100</div>
          <span className="cc-pulse-label">BIST 100</span>
        </div>
        <span className="cc-pulse-value cc-pulse-value--btc">{fmtIndex(pulse.bist100.value)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.bist100.changePercent) }}>
          {signed(pulse.bist100.changePercent)}
        </span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.bist100.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* BIST 30 */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--eth" style={{ fontWeight: 700, fontSize: 11 }}>30</div>
          <span className="cc-pulse-label">BIST 30</span>
        </div>
        <span className="cc-pulse-value">{fmtIndex(pulse.bist30.value)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.bist30.changePercent) }}>
          {signed(pulse.bist30.changePercent)}
        </span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.bist30.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* BIST Banka */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">BIST Banka</span>
        <span className="cc-pulse-value">{fmtIndex(pulse.bistBanka.value)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.bistBanka.changePercent) }}>
          {signed(pulse.bistBanka.changePercent)}
        </span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.bistBanka.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* BIST Sanayi */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">BIST Sanayi</span>
        <span className="cc-pulse-value">{fmtIndex(pulse.bistSinai.value)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.bistSinai.changePercent) }}>
          {signed(pulse.bistSinai.changePercent)}
        </span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.bistSinai.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* Toplam Hacim */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">Toplam Hacim</span>
        <span className="cc-pulse-value" style={{ fontSize: 16 }}>{pulse.toplamHacim}</span>
      </div>

      {/* Yabancı Oran */}
      <div className="cc-pulse-cell">
        <YabancıOranBar value={pulse.yabancıOran.value} change={pulse.yabancıOran.change} />
      </div>

      {/* Piyasa Durumu */}
      <div className="cc-pulse-cell">
        <PiyasaDurumuGauge value={pulse.piyasaDurumu.value} label={pulse.piyasaDurumu.label} />
      </div>

    </div>
  );
}
