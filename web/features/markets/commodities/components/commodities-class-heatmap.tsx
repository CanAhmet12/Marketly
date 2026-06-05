"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CommodityClassItem, CommodityClassPayload, CommodityHeatLevel } from "@/features/markets/commodities/types";

type Props = { classes: CommodityClassPayload };

const CLASS_ICONS: Record<string, string> = {
  "degerli-metal": "🥇",
  "enerji":        "⚡",
  "tarim":         "🌾",
  "endustri":      "⚙️",
  "yumusak":       "☕",
  "tahil":         "🌽",
};

function borderColor(level: CommodityHeatLevel): string {
  switch (level) {
    case "hot-strong":  return "#f97316";
    case "hot-mild":    return "rgba(249,115,22,0.4)";
    case "neutral":     return "var(--cc-border)";
    case "cold-mild":   return "rgba(239,68,68,0.4)";
    case "cold-strong": return "var(--cc-rose)";
  }
}

function changeColor(v: number): string {
  if (v > 0.5)  return "#f97316";
  if (v > 0)    return "rgba(249,115,22,0.7)";
  if (v < -0.5) return "var(--cc-rose)";
  if (v < 0)    return "rgba(239,68,68,0.7)";
  return "var(--cc-meta)";
}

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }

function ClassCell({ cls }: { cls: CommodityClassItem }) {
  const trend = cls.changePct > 0 ? "up" : cls.changePct < 0 ? "down" : "flat";
  return (
    <div className="cc-seg-cell" style={{ borderLeftColor: borderColor(cls.heatLevel) }}
      title={`${cls.name}: ${signed(cls.changePct)} — ${cls.leader}`}>
      <div className="cc-seg-header">
        <span className="cc-seg-icon" aria-hidden>{CLASS_ICONS[cls.id] ?? "●"}</span>
        <span className="cc-seg-name">{cls.name}</span>
      </div>
      <span className="cc-seg-change" style={{ color: changeColor(cls.changePct) }}>
        {signed(cls.changePct)}
      </span>
      <div className="cc-seg-sparkline">
        <MiniSparkline series={cls.sparkline} trend={trend} height={36} className="w-full" />
      </div>
    </div>
  );
}

export function CommoditiesClassHeatmap({ classes }: Props) {
  return (
    <div className="cc-section" role="region" aria-label="Emtia sinifi performansi">
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Sinif Performansi</p>
      <div className="cm-class-grid">
        {classes.classes.map((cls) => (
          <ClassCell key={cls.id} cls={cls} />
        ))}
      </div>
    </div>
  );
}
