"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import {
  exaggerateSpark,
  resolveBistSparkline,
  signedPct,
  trendFromSeries,
} from "@/features/markets/bist/lib/bist-sparkline-utils";
import type { BistHeatLevel, BistSectorItem, BistSectorPayload } from "@/features/markets/bist/types";
import { cn } from "@/lib/cn";

type Props = { sectors: BistSectorPayload };

const SECTOR_ICONS: Record<string, string> = {
  bankacilik: "🏦",
  holding: "🏢",
  sanayi: "⚙️",
  ulasim: "✈️",
  enerji: "⚡",
  perakende: "🛒",
  insaat: "🏗️",
  teknoloji: "💻",
};

function heatClass(level: BistHeatLevel): string {
  switch (level) {
    case "hot-strong":
      return "bc-seg-cell--hot-strong";
    case "hot-mild":
      return "bc-seg-cell--hot-mild";
    case "neutral":
      return "cc-seg-cell--neutral";
    case "cold-mild":
      return "bc-seg-cell--cold-mild";
    case "cold-strong":
      return "bc-seg-cell--cold-strong";
  }
}

function changeTone(v: number) {
  if (v > 1) return "bc-seg-change--strong-up";
  if (v > 0) return "bc-seg-change--up";
  if (v < -1) return "bc-seg-change--strong-down";
  if (v < 0) return "bc-seg-change--down";
  return "bc-seg-change--flat";
}

function SectorCell({ sec }: { sec: BistSectorItem }) {
  const spark = resolveBistSparkline(sec.changePercent, sec.sparkline);
  const boosted = exaggerateSpark(spark);
  const trend = trendFromSeries(boosted);

  return (
    <div
      className={cn("cc-seg-cell bc-seg-cell", heatClass(sec.heatLevel))}
      title={`${sec.name}: ${signedPct(sec.changePercent)} — ${sec.leader}`}
    >
      <div className="cc-seg-header">
        <span className="cc-seg-icon" aria-hidden>
          {SECTOR_ICONS[sec.id] ?? "●"}
        </span>
        <span className="cc-seg-name">{sec.name}</span>
      </div>
      <span className={cn("cc-seg-change", changeTone(sec.changePercent))}>{signedPct(sec.changePercent)}</span>
      <div className="cc-seg-sparkline">
        <MiniSparkline series={boosted} trend={trend} height={28} className="w-full" />
      </div>
    </div>
  );
}

export function BistSectorPerformance({ sectors }: Props) {
  if (!sectors.sectors.length) return null;

  return (
    <div className="cc-section bc-heatmap-section" role="region" aria-label="BIST sektör performansı">
      <p className="cc-section-label cc-section-label--spaced">Sektör Performansı</p>
      <div className="cc-seg-grid bc-seg-grid">
        {sectors.sectors.map((sec) => (
          <SectorCell key={sec.id} sec={sec} />
        ))}
      </div>
    </div>
  );
}
