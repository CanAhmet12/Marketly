"use client";

import type { StudioAudienceSegment } from "@/features/studio/repository/types";

type Props = {
  title: string;
  segments: StudioAudienceSegment[];
  emptyLabel?: string;
  fillClass?: string;
};

export function StudioAnalyticsBreakdown({
  title,
  segments,
  emptyLabel = "Bu dönem için veri yok.",
  fillClass,
}: Props) {
  return (
    <div className="st-block">
      <div className="st-block-header">
        <div className="st-block-title">{title}</div>
      </div>
      {segments.length === 0 ? (
        <div className="st-analytics-empty">{emptyLabel}</div>
      ) : (
        <div className="st-aud-rows">
          {segments.map((a) => (
            <div key={a.label} className="st-aud-row">
              <span className="st-aud-label">{a.label}</span>
              <div className="st-aud-bar">
                <div
                  className={fillClass ? `st-aud-fill ${fillClass}` : "st-aud-fill"}
                  style={{ width: `${a.percent}%` }}
                />
              </div>
              <span className="st-aud-pct">{a.percent}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
