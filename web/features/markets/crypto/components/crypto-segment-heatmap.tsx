"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { SegmentBadge } from "@/features/markets/crypto/components/crypto-editorial-icons";
import {
  resolveSegmentSparkline,
  trendFromSeries,
} from "@/features/markets/crypto/lib/crypto-sparkline-utils";
import type { CryptoSegmentItem, CryptoSegmentsPayload } from "@/features/markets/crypto/types";
import { cn } from "@/lib/cn";

type Props = { segments: CryptoSegmentsPayload };

function changeTone(v: number) {
  if (v > 2) return "cc-seg-change--strong-up";
  if (v > 0) return "cc-seg-change--up";
  if (v < -2) return "cc-seg-change--strong-down";
  if (v < 0) return "cc-seg-change--down";
  return "cc-seg-change--flat";
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function SegmentCell({ seg }: { seg: CryptoSegmentItem }) {
  const spark = resolveSegmentSparkline(seg.change24h, seg.sparkline);
  const trend = trendFromSeries(spark);

  const heatClass =
    seg.heatLevel === "hot-strong" ? "cc-seg-cell--hot-strong" :
    seg.heatLevel === "hot-mild" ? "cc-seg-cell--hot-mild" :
    seg.heatLevel === "cold-strong" ? "cc-seg-cell--cold-strong" :
    seg.heatLevel === "cold-mild" ? "cc-seg-cell--cold-mild" :
    "cc-seg-cell--neutral";

  return (
    <div className={cn("cc-seg-cell", heatClass)}>
      <div className="cc-seg-header">
        <SegmentBadge id={seg.id} />
        <span className="cc-seg-name">{seg.name}</span>
      </div>
      <span className={cn("cc-seg-change", changeTone(seg.change24h))}>
        {signed(seg.change24h)}
      </span>
      <div className="cc-seg-sparkline">
        <MiniSparkline series={spark} trend={trend} height={28} className="w-full" />
      </div>
    </div>
  );
}

export function CryptoSegmentHeatmap({ segments }: Props) {
  return (
    <div className="cc-section" role="region" aria-label="Piyasa ısı haritası">
      <p className="cc-section-label cc-section-label--spaced">Segment Performansı</p>
      <div className="cc-seg-grid">
        {segments.segments.map((seg) => (
          <SegmentCell key={seg.id} seg={seg} />
        ))}
      </div>
    </div>
  );
}
