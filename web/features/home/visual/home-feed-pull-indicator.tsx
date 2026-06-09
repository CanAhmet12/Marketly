"use client";

import type { CSSProperties } from "react";

type Props = {
  pullDistance: number;
  pulling: boolean;
  progress: number;
  ready: boolean;
  refreshing: boolean;
  threshold: number;
};

export function HomeFeedPullIndicator({
  pullDistance,
  pulling,
  progress,
  ready,
  refreshing,
  threshold,
}: Props) {
  if (!pulling && !refreshing) return null;

  const label = refreshing
    ? "Güncelleniyor…"
    : ready
      ? "Bırakın — yenilenecek"
      : "Yenilemek için çekin";

  return (
    <div
      className={`hv-ref__pull${refreshing ? " hv-ref__pull--refreshing" : ""}`}
      style={{ "--hv-pull-offset": `${Math.min(pullDistance, threshold)}px` } as CSSProperties}
      aria-hidden
    >
      <div
        className="hv-ref__pull-ring"
        style={{ transform: `rotate(${progress * 300}deg)`, opacity: Math.max(0.35, progress) }}
      />
      <span className="hv-ref__pull-label">{label}</span>
    </div>
  );
}
