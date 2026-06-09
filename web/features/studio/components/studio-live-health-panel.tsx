"use client";

import { formatCompactCount } from "@/lib/format-compact-count";
import type { StudioLiveHealth } from "@/features/studio/lib/studio-live-insights";
import { cn } from "@/lib/cn";

type Props = {
  health: StudioLiveHealth;
  durationLabel?: string | null;
};

export function StudioLiveHealthPanel({ health, durationLabel }: Props) {
  return (
    <div className="st-block">
      <div className="st-block-header">
        <div className="st-block-title">Yayın Sağlığı</div>
      </div>
      <div className="st-live-health-grid">
        <div className="st-live-health-item">
          <span className="st-live-health-label">Bağlantı</span>
          <span
            className={cn(
              "st-live-health-value",
              health.connectionTone === "ok" && "st-live-health-value--ok",
              health.connectionTone === "warn" && "st-live-health-value--warn",
            )}
          >
            {health.connectionLabel}
          </span>
        </div>
        <div className="st-live-health-item">
          <span className="st-live-health-label">Agora RTC</span>
          <span className="st-live-health-value">
            {health.agoraConfigured ? "Yapılandırıldı" : "Eksik"}
          </span>
        </div>
        <div className="st-live-health-item">
          <span className="st-live-health-label">İzleyici</span>
          <span className="st-live-health-value st-live-health-value--num">
            {formatCompactCount(health.viewerCount)}
          </span>
        </div>
        {durationLabel ? (
          <div className="st-live-health-item">
            <span className="st-live-health-label">Süre</span>
            <span className="st-live-health-value">{durationLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
