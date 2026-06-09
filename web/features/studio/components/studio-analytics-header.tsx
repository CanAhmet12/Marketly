"use client";

import Link from "next/link";

import { analyticsBreadcrumb } from "@/features/studio/lib/studio-analytics-insights";
import type { StudioTimeframe } from "@/features/studio/types";
import { cn } from "@/lib/cn";

const TFS: { id: StudioTimeframe; label: string }[] = [
  { id: "7d", label: "7 Gün" },
  { id: "28d", label: "28 Gün" },
  { id: "90d", label: "90 Gün" },
];

type Props = {
  timeframe: StudioTimeframe;
  onTimeframeChange: (tf: StudioTimeframe) => void;
  isFetching?: boolean;
};

export function StudioAnalyticsHeader({ timeframe, onTimeframeChange, isFetching }: Props) {
  return (
    <div className="st-analytics-header">
      <div className="st-analytics-header-left">
        <p className="st-page-eyebrow">Performans</p>
        <h1 className="st-analytics-page-title">Analitik</h1>
        <p className="st-analytics-crumb">{analyticsBreadcrumb(timeframe)}</p>
        <div className="st-chart-tf">
          {TFS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cn("st-tf-btn", timeframe === t.id && "st-tf-btn--active")}
              onClick={() => onTimeframeChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {isFetching ? <span className="st-analytics-fetching">Güncelleniyor…</span> : null}
      </div>
      <Link href="/studio/economy" className="st-block-link">
        Ekonomi & Dönüşüm →
      </Link>
    </div>
  );
}
