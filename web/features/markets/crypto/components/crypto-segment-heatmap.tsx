"use client";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CryptoSegmentItem, CryptoSegmentsPayload } from "@/features/markets/crypto/types";

type Props = { segments: CryptoSegmentsPayload };

const SEGMENT_ICONS: Record<string, string> = {
  l1:     "🔥",
  defi:   "💧",
  l2:     "⚡",
  ai:     "🤖",
  meme:   "💣",
  gaming: "🎮",
  stablecoin: "🟡",
  rwa:    "🏠",
};

const SPARKLINES: Record<string, number[]> = {
  l1:     [3.1, 4.2, 3.8, 5.0, 4.6, 5.5, 5.84],
  defi:   [1.8, 2.4, 2.1, 2.8, 3.0, 3.1, 3.21],
  l2:     [0.8, 1.1, 0.9, 1.3, 1.2, 1.5, 1.47],
  ai:     [0.3, 0.6, 0.5, 0.7, 0.8, 0.9, 0.88],
  meme:   [-1.2, -2.0, -1.8, -2.5, -3.1, -3.4, -3.61],
  gaming: [-0.4, -0.8, -0.6, -1.0, -1.1, -1.2, -1.22],
};

function changeColor(v: number) {
  if (v > 2)  return "var(--cc-teal)";
  if (v > 0)  return "var(--cc-teal-muted)";
  if (v < -2) return "var(--cc-rose)";
  if (v < 0)  return "var(--cc-rose-muted)";
  return "var(--cc-meta)";
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function SegmentCell({ seg }: { seg: CryptoSegmentItem }) {
  const spark = SPARKLINES[seg.id] ?? [0, seg.change24h];
  const trend = seg.change24h > 0 ? "up" : seg.change24h < 0 ? "down" : "flat";

  const heatClass =
    seg.heatLevel === "hot-strong"  ? "cc-seg-cell--hot-strong"  :
    seg.heatLevel === "hot-mild"    ? "cc-seg-cell--hot-mild"    :
    seg.heatLevel === "cold-strong" ? "cc-seg-cell--cold-strong" :
    seg.heatLevel === "cold-mild"   ? "cc-seg-cell--cold-mild"   :
    "cc-seg-cell--neutral";

  return (
    <div className={`cc-seg-cell ${heatClass}`}>
      <div className="cc-seg-header">
        <span className="cc-seg-icon" aria-hidden>{SEGMENT_ICONS[seg.id] ?? "●"}</span>
        <span className="cc-seg-name">{seg.name}</span>
      </div>
      <span className="cc-seg-change" style={{ color: changeColor(seg.change24h) }}>
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
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Piyasa Isı Haritası</p>
      <div className="cc-seg-grid">
        {segments.segments.map((seg) => (
          <SegmentCell key={seg.id} seg={seg} />
        ))}
      </div>
    </div>
  );
}
