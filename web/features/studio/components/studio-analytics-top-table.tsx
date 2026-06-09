"use client";

import Link from "next/link";

import type { AnalyticsTopRow } from "@/features/studio/lib/studio-analytics-insights";
import { formatCompactCount } from "@/lib/format-compact-count";

type Props = {
  title: string;
  rows: AnalyticsTopRow[];
  emptyLabel?: string;
  editBase?: string;
};

export function StudioAnalyticsTopTable({
  title,
  rows,
  emptyLabel = "Bu dönem için kayıt yok.",
  editBase = "/studio/content",
}: Props) {
  return (
    <div className="st-block">
      <div className="st-block-header">
        <div className="st-block-title">{title}</div>
        <span className="st-analytics-table-count">{rows.length} kayıt</span>
      </div>
      {rows.length === 0 ? (
        <div className="st-analytics-empty">{emptyLabel}</div>
      ) : (
        <div className="st-analytics-top-list">
          {rows.map((row, index) => (
            <div key={row.id} className="st-analytics-top-row">
              <span className="st-analytics-top-rank">{index + 1}</span>
              <div className="st-analytics-top-thumb">
                {row.thumbnailUrl ? (
                  <img src={row.thumbnailUrl} alt="" />
                ) : (
                  <span className="st-list-thumb-placeholder">{row.kind}</span>
                )}
              </div>
              <div className="st-analytics-top-info">
                <Link href={row.href} className="st-analytics-top-title">
                  {row.title}
                </Link>
                <div className="st-analytics-top-meta">{formatCompactCount(row.views)} görüntülenme</div>
              </div>
              <div className="st-analytics-top-actions">
                <Link href={`${editBase}/${encodeURIComponent(row.id)}/edit`} className="st-list-action">
                  Düzenle
                </Link>
                <Link href={row.href} className="st-list-action">
                  Görüntüle
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
