"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { TechHeatLevel, TechSectorItem, NasdaqSectorPayload } from "@/features/markets/nasdaq/types";

type Props = { sectors: NasdaqSectorPayload };

const SECTOR_ICONS: Record<string, string> = {
  ai:       "🤖",
  semi:     "⚡",
  ev:       "🔋",
  cloud:    "☁️",
  software: "💻",
  security: "🔒",
  biotech:  "🧬",
  media:    "🎬",
};

function borderColor(level: TechHeatLevel): string {
  switch (level) {
    case "hot-strong":  return "#06b6d4";
    case "hot-mild":    return "rgba(6,182,212,0.4)";
    case "neutral":     return "var(--cc-border)";
    case "cold-mild":   return "rgba(239,68,68,0.4)";
    case "cold-strong": return "var(--cc-rose)";
  }
}

function changeColor(v: number): string {
  if (v > 1)  return "#06b6d4";
  if (v > 0)  return "rgba(6,182,212,0.7)";
  if (v < -1) return "var(--cc-rose)";
  if (v < 0)  return "rgba(239,68,68,0.7)";
  return "var(--cc-meta)";
}

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }

function SectorCell({ sec }: { sec: TechSectorItem }) {
  const trend = sec.changePct > 0 ? "up" : sec.changePct < 0 ? "down" : "flat";
  return (
    <div className="cc-seg-cell" style={{ borderLeftColor: borderColor(sec.heatLevel) }}
      title={`${sec.name}: ${signed(sec.changePct)} — ${sec.leader}`}>
      <div className="cc-seg-header">
        <span className="cc-seg-icon" aria-hidden>{SECTOR_ICONS[sec.id] ?? "●"}</span>
        <span className="cc-seg-name">{sec.name}</span>
      </div>
      <span className="cc-seg-change" style={{ color: changeColor(sec.changePct) }}>
        {signed(sec.changePct)}
      </span>
      <div className="cc-seg-sparkline">
        <MiniSparkline series={sec.sparkline} trend={trend} height={36} className="w-full" />
      </div>
    </div>
  );
}

export function NasdaqSectorHeatmap({ sectors }: Props) {
  return (
    <div className="cc-section" role="region" aria-label="Tech sektor haritasi">
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Tech Sektor Haritasi</p>
      <div className="nq-sector-grid">
        {sectors.sectors.map((sec) => (
          <SectorCell key={sec.id} sec={sec} />
        ))}
      </div>
    </div>
  );
}
