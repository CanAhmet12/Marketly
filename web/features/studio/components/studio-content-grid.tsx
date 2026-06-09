"use client";

import Link from "next/link";

import {
  contentKindBadgeClass,
  contentKindShort,
  contentStatusBadgeClass,
  contentStatusLabel,
  formatContentDate,
} from "@/features/studio/lib/studio-content-display";
import type { CreatorContentItem } from "@/features/studio/repository/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type Props = {
  items: CreatorContentItem[];
};

export function StudioContentGrid({ items }: Props) {
  return (
    <div className="st-content-grid">
      {items.map((item) => (
        <div key={item.id} className="st-content-card">
          <div className="st-content-thumb">
            {item.thumbnailUrl ? (
              <img src={item.thumbnailUrl} alt={item.title} />
            ) : (
              <div className="st-content-thumb-placeholder">{contentKindShort(item.kind)}</div>
            )}
            <span className={cn("st-content-kind-badge", contentKindBadgeClass(item.kind))}>
              {item.kind}
            </span>
            <span className={cn("st-content-status", contentStatusBadgeClass(item.status))}>
              {contentStatusLabel(item.status)}
            </span>
          </div>
          <div className="st-content-body">
            <div className="st-content-title">{item.title}</div>
            <div className="st-content-meta">
              <span>{formatCompactCount(item.views)} görüntülenme</span>
              <span>·</span>
              <span>{formatCompactCount(item.likes + item.comments)} etk.</span>
              {item.publishedAt ? (
                <>
                  <span>·</span>
                  <span>{formatContentDate(item.publishedAt)}</span>
                </>
              ) : null}
            </div>
            <div className="st-content-card-actions">
              <Link
                href={`/studio/content/${encodeURIComponent(item.id)}/edit`}
                className="studio-hbtn studio-hbtn--ghost st-content-card-btn"
              >
                Düzenle
              </Link>
              <Link
                href={item.href ?? `/post/${encodeURIComponent(item.id)}`}
                className="studio-hbtn studio-hbtn--ghost st-content-card-btn"
              >
                Görüntüle →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
