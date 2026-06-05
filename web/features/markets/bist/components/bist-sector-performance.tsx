"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { BistSectorItem, BistSectorPayload } from "@/features/markets/bist/types";
import { cn } from "@/lib/cn";

type Props = { sectors: BistSectorPayload };

const SECTOR_ICONS: Record<string, string> = {
  bankacilik: "🏦",
  holding:    "🏢",
  sanayi:     "⚙️",
  ulasim:     "✈️",
  enerji:     "⚡",
  perakende:  "🛒",
  insaat:     "🏗️",
  teknoloji:  "💻",
};

function changeColor(v: number) {
  if (v > 2)  return "var(--cc-teal)";
  if (v > 0)  return "rgba(34,197,94,0.7)";
  if (v < -2) return "var(--cc-rose)";
  if (v < 0)  return "rgba(239,68,68,0.7)";
  return "var(--cc-meta)";
}

function heatBorderColor(level: BistSectorItem["heatLevel"]) {
  switch (level) {
    case "hot-strong":  return "var(--cc-teal)";
    case "hot-mild":    return "rgba(34,197,94,0.4)";
    case "neutral":     return "var(--cc-border)";
    case "cold-mild":   return "rgba(239,68,68,0.4)";
    case "cold-strong": return "var(--cc-rose)";
  }
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function SectorCell({ sec }: { sec: BistSectorItem }) {
  const trend = sec.changePercent > 0 ? "up" : sec.changePercent < 0 ? "down" : "flat";
  return (
    <div
      className="cc-seg-cell"
      style={{ borderLeftColor: heatBorderColor(sec.heatLevel) }}
      title={`${sec.name}: ${signed(sec.changePercent)} — ${sec.leader}`}
    >
      <div className="cc-seg-header">
        <span className="cc-seg-icon" aria-hidden>{SECTOR_ICONS[sec.id] ?? "●"}</span>
        <span className="cc-seg-name">{sec.name}</span>
      </div>
      <span className="cc-seg-change" style={{ color: changeColor(sec.changePercent) }}>
        {signed(sec.changePercent)}
      </span>
      <div className="cc-seg-sparkline">
        <MiniSparkline series={sec.sparkline} trend={trend} height={36} className="w-full" />
      </div>
    </div>
  );
}

export function BistSectorPerformance({ sectors }: Props) {
  return (
    <div className="cc-section" role="region" aria-label="Sektor performansi">
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Sektor Performansi</p>
      <div className="bc-sector-grid">
        {sectors.sectors.map((sec) => (
          <SectorCell key={sec.id} sec={sec} />
        ))}
      </div>
    </div>
  );
}
