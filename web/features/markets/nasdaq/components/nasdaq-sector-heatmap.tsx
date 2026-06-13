"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import {
  exaggerateSpark,
  resolveNasdaqSparkline,
  signedPct,
  trendFromSeries,
} from "@/features/markets/nasdaq/lib/nasdaq-sparkline-utils";
import type { NasdaqSectorPayload, TechHeatLevel, TechSectorItem } from "@/features/markets/nasdaq/types";
import { cn } from "@/lib/cn";

type Props = { sectors: NasdaqSectorPayload };

const SECTOR_ICONS: Record<string, string> = {
  ai: "🤖",
  semi: "⚡",
  ev: "🔋",
  cloud: "☁️",
  software: "💻",
  security: "🔒",
  biotech: "🧬",
  media: "🎬",
};

function heatClass(level: TechHeatLevel): string {
  switch (level) {
    case "hot-strong":
      return "nq-seg-cell--hot-strong";
    case "hot-mild":
      return "nq-seg-cell--hot-mild";
    case "neutral":
      return "cc-seg-cell--neutral";
    case "cold-mild":
      return "nq-seg-cell--cold-mild";
    case "cold-strong":
      return "nq-seg-cell--cold-strong";
  }
}

function changeTone(v: number) {
  if (v > 1) return "nq-seg-change--strong-up";
  if (v > 0) return "nq-seg-change--up";
  if (v < -1) return "nq-seg-change--strong-down";
  if (v < 0) return "nq-seg-change--down";
  return "nq-seg-change--flat";
}

function SectorCell({ sec }: { sec: TechSectorItem }) {
  const spark = resolveNasdaqSparkline(sec.changePct, sec.sparkline);
  const boosted = exaggerateSpark(spark);
  const trend = trendFromSeries(boosted);

  return (
    <div
      className={cn("cc-seg-cell nq-seg-cell", heatClass(sec.heatLevel))}
      title={`${sec.name}: ${signedPct(sec.changePct)} — ${sec.leader}`}
    >
      <div className="cc-seg-header">
        <span className="cc-seg-icon" aria-hidden>
          {SECTOR_ICONS[sec.id] ?? "●"}
        </span>
        <span className="cc-seg-name">{sec.name}</span>
      </div>
      <span className={cn("cc-seg-change", changeTone(sec.changePct))}>{signedPct(sec.changePct)}</span>
      <div className="cc-seg-sparkline">
        <MiniSparkline series={boosted} trend={trend} height={28} className="w-full" />
      </div>
    </div>
  );
}

export function NasdaqSectorHeatmap({ sectors }: Props) {
  if (!sectors.sectors.length) return null;

  return (
    <div className="cc-section nq-heatmap-section" role="region" aria-label="Tech sektör haritası">
      <p className="cc-section-label cc-section-label--spaced">Tech Sektör Haritası</p>
      <div className="cc-seg-grid nq-seg-grid">
        {sectors.sectors.map((sec) => (
          <SectorCell key={sec.id} sec={sec} />
        ))}
      </div>
    </div>
  );
}
