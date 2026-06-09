"use client";

import Link from "next/link";

import { formatRevenueUsd } from "@/features/studio/lib/studio-economy-insights";
import type { CreatorStudioEconomyHubPayload, StudioEconomyRevenueSnapshot } from "@/features/studio/repository/types";
import { cn } from "@/lib/cn";

type Props = {
  hub: CreatorStudioEconomyHubPayload;
  snapshot: StudioEconomyRevenueSnapshot;
};

export function StudioEconomyRevenueHero({ hub, snapshot }: Props) {
  const hasRevenue = snapshot.estimatedTotalUsd != null && snapshot.estimatedTotalUsd > 0;

  return (
    <div className="st-revenue-hero">
      <div className="st-revenue-main">
        <span className="st-revenue-tag">
          {snapshot.dataSource === "live" ? "Canlı Tahmini Gelir" : "Bu Ay Tahmini Gelir"}
        </span>
        <div className="st-revenue-amount">{formatRevenueUsd(snapshot.estimatedTotalUsd)}</div>
        <div className="st-revenue-sub">{hub.headline}</div>
        <p className="st-economy-subline">{hub.subline}</p>
        {hasRevenue && snapshot.changePercent !== 0 ? (
          <span className={cn("st-metric-change", snapshot.changePercent > 0 ? "st-metric-change--up" : "st-metric-change--neu")}>
            {snapshot.changePercent > 0 ? "+" : ""}
            {snapshot.changePercent}% dönem
          </span>
        ) : null}
        {hub.data_sparse ? (
          <p className="st-economy-sparse-hint">{hub.revenue.revenue_band_placeholder}</p>
        ) : null}
      </div>

      <div className="st-economy-hero-stats">
        <div className="st-economy-hero-stat">
          <div className="st-economy-hero-stat-val st-economy-hero-stat-val--accent">
            {snapshot.activeSubscribers}
          </div>
          <div className="st-economy-hero-stat-label">Aktif Abone</div>
        </div>
        <div className="st-economy-hero-stat">
          <div className="st-economy-hero-stat-val st-economy-hero-stat-val--violet">
            {snapshot.monetizedSignals}
          </div>
          <div className="st-economy-hero-stat-label">Monetize Sinyal</div>
        </div>
        <div className="st-economy-hero-stat">
          <div className="st-economy-hero-stat-val">{snapshot.premiumRooms}</div>
          <div className="st-economy-hero-stat-label">Premium Oda</div>
        </div>
      </div>

      <div className="st-economy-nav-cross">
        {hub.nav_cross.slice(0, 5).map((n) => (
          <Link key={n.href} href={n.href} className="st-economy-nav-link">
            {n.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
