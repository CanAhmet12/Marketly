"use client";

import Link from "next/link";

import type { StudioLiveStreamItem } from "@/features/studio/repository/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

function scheduleLabel(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: StudioLiveStreamItem["status"]): string {
  if (status === "live") return "st-live-badge--live";
  if (status === "ended") return "st-live-badge--ended";
  return "st-live-badge--scheduled";
}

function statusLabel(status: StudioLiveStreamItem["status"]): string {
  if (status === "live") return "CANLI";
  if (status === "ended") return "BİTTİ";
  return "PLANLI";
}

type Props = {
  title: string;
  items: StudioLiveStreamItem[];
  emptyTitle: string;
  emptyBody: string;
  actionHref?: string;
  actionLabel?: string;
};

export function StudioLiveSchedulePanel({
  title,
  items,
  emptyTitle,
  emptyBody,
  actionHref = "/upload",
  actionLabel = "Yayın Başlat",
}: Props) {
  return (
    <div className="st-block">
      <div className="st-block-header">
        <div className="st-block-title">{title}</div>
        <Link href={actionHref} className="st-block-link">
          + {actionLabel}
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="st-live-schedule-empty">
          <div className="st-live-schedule-empty-title">{emptyTitle}</div>
          <div className="st-live-schedule-empty-body">{emptyBody}</div>
        </div>
      ) : (
        <div>
          {items.map((s) => (
            <div key={s.id} className="st-list-item">
              <div className="st-list-thumb">
                {s.thumbnailUrl ? (
                  <img src={s.thumbnailUrl} alt="" />
                ) : (
                  <span className="st-list-thumb-placeholder">LIVE</span>
                )}
              </div>
              <div className="st-list-info">
                <div className="st-list-title">{s.title}</div>
                <div className="st-list-meta">
                  {scheduleLabel(s.scheduledStart)}
                  {s.reminderCount > 0 ? ` · ${formatCompactCount(s.reminderCount)} hatırlatıcı` : ""}
                  {s.viewerCount != null && s.status === "ended"
                    ? ` · ${formatCompactCount(s.viewerCount)} izleyici`
                    : ""}
                </div>
                {s.description ? <p className="st-list-preview">{s.description}</p> : null}
              </div>
              <div className="st-list-actions">
                <span className={cn("st-live-badge", statusClass(s.status))}>{statusLabel(s.status)}</span>
                {s.href ? (
                  <Link href={s.href} className="st-list-action">
                    {s.status === "live" ? "Yönet" : "Görüntüle"}
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
