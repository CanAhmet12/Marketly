"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CommodityClassItem, CommodityClassPayload, CommodityHeatLevel } from "@/features/markets/commodities/types";
import {
  exaggerateSpark,
  resolveCommoditySparkline,
  signedPct,
  trendFromSeries,
} from "@/features/markets/commodities/lib/commodity-sparkline-utils";
import { cn } from "@/lib/cn";

type Props = { classes: CommodityClassPayload };

const CLASS_ICONS: Record<string, string> = {
  "degerli-metal": "🥇",
  enerji: "⚡",
  tarim: "🌾",
  endustri: "⚙️",
  yumusak: "☕",
  tahil: "🌽",
};

function heatClass(level: CommodityHeatLevel): string {
  switch (level) {
    case "hot-strong":
      return "cm-seg-cell--hot-strong";
    case "hot-mild":
      return "cm-seg-cell--hot-mild";
    case "neutral":
      return "cc-seg-cell--neutral";
    case "cold-mild":
      return "cm-seg-cell--cold-mild";
    case "cold-strong":
      return "cm-seg-cell--cold-strong";
  }
}

function changeTone(v: number) {
  if (v > 0.5) return "cm-seg-change--strong-up";
  if (v > 0) return "cm-seg-change--up";
  if (v < -0.5) return "cm-seg-change--strong-down";
  if (v < 0) return "cm-seg-change--down";
  return "cm-seg-change--flat";
}

function ClassCell({ cls }: { cls: CommodityClassItem }) {
  const spark = resolveCommoditySparkline(cls.changePct, cls.sparkline);
  const boosted = exaggerateSpark(spark);
  const trend = trendFromSeries(boosted);

  return (
    <div
      className={cn("cc-seg-cell cm-seg-cell", heatClass(cls.heatLevel))}
      title={`${cls.name}: ${signedPct(cls.changePct)} — ${cls.leader}`}
    >
      <div className="cc-seg-header">
        <span className="cc-seg-icon" aria-hidden>
          {CLASS_ICONS[cls.id] ?? "●"}
        </span>
        <span className="cc-seg-name">{cls.name}</span>
      </div>
      <span className={cn("cc-seg-change", changeTone(cls.changePct))}>{signedPct(cls.changePct)}</span>
      <div className="cc-seg-sparkline">
        <MiniSparkline series={boosted} trend={trend} height={28} className="w-full" />
      </div>
    </div>
  );
}

export function CommoditiesClassHeatmap({ classes }: Props) {
  if (!classes.classes.length) return null;

  return (
    <div className="cc-section cm-heatmap-section" role="region" aria-label="Emtia sınıf performansı">
      <p className="cc-section-label cc-section-label--spaced">Sınıf Performansı</p>
      <div className="cc-seg-grid cm-seg-grid">
        {classes.classes.map((cls) => (
          <ClassCell key={cls.id} cls={cls} />
        ))}
      </div>
    </div>
  );
}
