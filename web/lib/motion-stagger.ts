import type { CSSProperties } from "react";

/** P7-001 — feed/grid stagger (index × 50ms, capped) */
export const MOTION_STAGGER_MS = 50;
export const MOTION_STAGGER_CAP = 8;

export function motionEntranceDelay(
  index: number,
  stepMs: number = MOTION_STAGGER_MS,
  cap: number = MOTION_STAGGER_CAP,
): CSSProperties {
  return { animationDelay: `${Math.min(index, cap) * stepMs}ms` };
}
