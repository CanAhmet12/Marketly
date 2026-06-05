"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CommodityPulseMetrics } from "@/features/markets/commodities/types";
import { cn } from "@/lib/cn";

type Props = { pulse: CommodityPulseMetrics };

function fmtPrice(n: number, unit: string) {
  if (unit === "c/bu") return `${n.toFixed(0)}`;
  if (unit === "$/oz" && n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (unit === "$/bbl" || unit === "$/lb") return `$${n.toFixed(2)}`;
  if (unit === "$/mmbtu") return `$${n.toFixed(2)}`;
  return `$${n.toFixed(2)}`;
}

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }
function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)"; if (v < 0) return "var(--cc-rose)"; return "var(--cc-meta)";
}

function TrendScoreCell({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "#f97316" : value >= 45 ? "rgba(249,115,22,0.7)" : "var(--cc-meta)";
  return (
    <div className="cm-trend-score">
      <span className="cc-pulse-label">Emtia Trendi</span>
      <div className="cm-trend-value-row">
        <span className="cm-trend-big" style={{ color }}>{value}</span>
        <span className="cm-trend-sub">/100</span>
      </div>
      <div className="cm-trend-bar">
        <div className="cm-trend-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="cm-trend-label" style={{ color }}>{label}</span>
    </div>
  );
}

export function CommoditiesPulseBar({ pulse }: Props) {
  const items = [
    { item: pulse.altin,    isMain: true,  icon: "Au",  showSpark: true  },
    { item: pulse.gumus,    isMain: false, icon: "Ag",  showSpark: true  },
    { item: pulse.petrol,   isMain: false, icon: null,  showSpark: false },
    { item: pulse.dogalgaz, isMain: false, icon: null,  showSpark: false },
    { item: pulse.bakir,    isMain: false, icon: null,  showSpark: false },
    { item: pulse.bugday,   isMain: false, icon: null,  showSpark: false },
  ];

  return (
    <div className="cc-pulse-bar-v2" role="region" aria-label="Emtia piyasa metrikleri">

      {/* ALTIN */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--btc" style={{ fontSize: 9, fontWeight: 900 }}>Au</div>
          <span className="cc-pulse-label">ALTIN</span>
        </div>
        <span className="cc-pulse-value cc-pulse-value--btc">{fmtPrice(pulse.altin.price, pulse.altin.unit)}</span>
        <span style={{ fontSize: 10, color: "var(--cc-meta)" }}>{pulse.altin.unit}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.altin.changePct) }}>{signed(pulse.altin.changePct)}</span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.altin.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* GUMUS */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--eth" style={{ fontSize: 9, fontWeight: 900 }}>Ag</div>
          <span className="cc-pulse-label">GUMUS</span>
        </div>
        <span className="cc-pulse-value">{fmtPrice(pulse.gumus.price, pulse.gumus.unit)}</span>
        <span style={{ fontSize: 10, color: "var(--cc-meta)" }}>{pulse.gumus.unit}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.gumus.changePct) }}>{signed(pulse.gumus.changePct)}</span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.gumus.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* PETROL */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">PETROL WTI</span>
        <span className="cc-pulse-value">{fmtPrice(pulse.petrol.price, pulse.petrol.unit)}</span>
        <span style={{ fontSize: 10, color: "var(--cc-meta)" }}>{pulse.petrol.unit}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.petrol.changePct) }}>{signed(pulse.petrol.changePct)}</span>
      </div>

      {/* DOGALGAZ */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">DOGALGAZ</span>
        <span className="cc-pulse-value" style={{ fontSize: 16 }}>{fmtPrice(pulse.dogalgaz.price, pulse.dogalgaz.unit)}</span>
        <span style={{ fontSize: 10, color: "var(--cc-meta)" }}>{pulse.dogalgaz.unit}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.dogalgaz.changePct) }}>{signed(pulse.dogalgaz.changePct)}</span>
      </div>

      {/* BAKIR */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">BAKIR</span>
        <span className="cc-pulse-value" style={{ fontSize: 16 }}>{fmtPrice(pulse.bakir.price, pulse.bakir.unit)}</span>
        <span style={{ fontSize: 10, color: "var(--cc-meta)" }}>{pulse.bakir.unit}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.bakir.changePct) }}>{signed(pulse.bakir.changePct)}</span>
      </div>

      {/* Emtia Endeksi */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">Emtia Endeksi</span>
        <span className="cc-pulse-value cc-pulse-value--btc" style={{ fontSize: 16 }}>{pulse.endeks.value.toFixed(1)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.endeks.changePct) }}>{signed(pulse.endeks.changePct)}</span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={pulse.endeks.sparkline} trend="up" height={30} className="w-full" />
        </div>
      </div>

      {/* Emtia Trend Puani */}
      <div className="cc-pulse-cell">
        <TrendScoreCell value={pulse.trendScore.value} label={pulse.trendScore.label} />
      </div>

    </div>
  );
}
