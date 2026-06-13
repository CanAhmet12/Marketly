"use client";

import type { ReactNode } from "react";

import type { MarketAssetCategory } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Keşfet → Sinyaller sekmesi */
  embed?: boolean;
  /** Aktif piyasa segmenti — ambient ton */
  dataMarket?: MarketAssetCategory | "all";
  className?: string;
};

/** Signal Market Canvas — scoped surface + ambient */
export function SignalsCanvasShell({ children, embed = false, dataMarket = "all", className }: Props) {
  return (
    <div
      className={cn(
        "sig-canvas sig-canvas--headless sp-canvas sp-canvas--headless sp-canvas--live min-w-0",
        embed && "sig-canvas--embed sp-canvas--discover-embed",
        !embed && "ms-page-wrapper ms-page-wrapper--compact",
        className,
      )}
      data-sp-market={dataMarket}
    >
      {!embed ? (
        <div className="sig-canvas__ambient sp-ambient" aria-hidden>
          <span className="sig-canvas__orb sig-canvas__orb--mint sp-ambient__orb sp-ambient__orb--primary" />
          <span className="sig-canvas__orb sig-canvas__orb--signal sp-ambient__orb sp-ambient__orb--market" />
          <span className="sig-canvas__orb sig-canvas__orb--floor sp-ambient__orb sp-ambient__orb--floor" />
          <span className="sig-canvas__grid sp-ambient__grid" />
        </div>
      ) : null}

      <div className="sig-canvas__inner sp-canvas-body">{children}</div>
    </div>
  );
}
