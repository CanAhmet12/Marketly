"use client";

import Link from "next/link";

import {
  contentKindBadgeClass,
  contentKindLabelTr,
  contentKindShort,
  contentStatusBadgeClass,
  contentStatusLabel,
  contentVisibilityLabel,
  formatContentDate,
} from "@/features/studio/lib/studio-content-display";
import type { ContentSortKey } from "@/features/studio/lib/studio-content-library";
import { toggleSort } from "@/features/studio/lib/studio-content-library";
import type { CreatorContentItem } from "@/features/studio/repository/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type SortState = { sortKey: ContentSortKey; sortDir: "asc" | "desc" };

type Props = {
  items: CreatorContentItem[];
  sort: SortState;
  onSortChange: (sort: SortState) => void;
};

function SortHeader({
  label,
  colKey,
  sort,
  onSortChange,
}: {
  label: string;
  colKey: ContentSortKey;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
}) {
  const active = sort.sortKey === colKey;
  const arrow = active ? (sort.sortDir === "desc" ? " ↓" : " ↑") : "";
  return (
    <button
      type="button"
      className={cn("st-content-th-btn", active && "st-content-th-btn--active")}
      onClick={() => onSortChange(toggleSort(sort, colKey))}
    >
      {label}
      {arrow}
    </button>
  );
}

export function StudioContentTable({ items, sort, onSortChange }: Props) {
  return (
    <div className="st-content-table-wrap">
      <table className="st-content-table">
        <thead>
          <tr>
            <th className="st-content-th st-content-th--main">
              <SortHeader label="İçerik" colKey="title" sort={sort} onSortChange={onSortChange} />
            </th>
            <th className="st-content-th">Tür</th>
            <th className="st-content-th">Durum</th>
            <th className="st-content-th st-content-th--num">
              <SortHeader label="Görüntülenme" colKey="views" sort={sort} onSortChange={onSortChange} />
            </th>
            <th className="st-content-th st-content-th--num">
              <SortHeader label="Etkileşim" colKey="engagement" sort={sort} onSortChange={onSortChange} />
            </th>
            <th className="st-content-th">
              <SortHeader label="Tarih" colKey="date" sort={sort} onSortChange={onSortChange} />
            </th>
            <th className="st-content-th st-content-th--actions">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const engagement = item.likes + item.comments;
            const viewHref = item.href ?? `/post/${encodeURIComponent(item.id)}`;
            return (
              <tr key={item.id} className="st-content-tr">
                <td className="st-content-td st-content-td--main">
                  <div className="st-content-table-cell-main">
                    <div className="st-content-table-thumb">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt="" />
                      ) : (
                        <span className="st-list-thumb-placeholder">{contentKindShort(item.kind)}</span>
                      )}
                    </div>
                    <div className="st-content-table-info">
                      <Link
                        href={`/studio/content/${encodeURIComponent(item.id)}/edit`}
                        className="st-content-table-title"
                      >
                        {item.title}
                      </Link>
                      <div className="st-content-table-sub">
                        {contentVisibilityLabel(item.visibility)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="st-content-td">
                  <span className={cn("st-content-table-kind", contentKindBadgeClass(item.kind))}>
                    {contentKindLabelTr(item.kind)}
                  </span>
                </td>
                <td className="st-content-td">
                  <span className={cn("st-content-table-status", contentStatusBadgeClass(item.status))}>
                    {contentStatusLabel(item.status)}
                  </span>
                </td>
                <td className="st-content-td st-content-td--num">{formatCompactCount(item.views)}</td>
                <td className="st-content-td st-content-td--num">{formatCompactCount(engagement)}</td>
                <td className="st-content-td">{formatContentDate(item.publishedAt)}</td>
                <td className="st-content-td st-content-td--actions">
                  <div className="st-content-table-actions">
                    <Link
                      href={`/studio/content/${encodeURIComponent(item.id)}/edit`}
                      className="st-list-action"
                    >
                      Düzenle
                    </Link>
                    <Link href={viewHref} className="st-list-action">
                      Görüntüle
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
