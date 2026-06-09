"use client";

import type { ContentLibraryFilters, ContentSortKey, ContentViewMode } from "@/features/studio/lib/studio-content-library";
import type { StudioContentKind, StudioContentStatus } from "@/features/studio/types";
import { cn } from "@/lib/cn";

const KIND_FILTERS: { id: "all" | StudioContentKind; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "video", label: "Video" },
  { id: "signal", label: "Sinyal" },
  { id: "post", label: "Gönderi" },
  { id: "short", label: "Short" },
  { id: "live", label: "Canlı" },
];

const STATUS_FILTERS: { id: "all" | StudioContentStatus; label: string }[] = [
  { id: "all", label: "Tüm durum" },
  { id: "published", label: "Yayında" },
  { id: "live", label: "Canlı" },
  { id: "scheduled", label: "Zamanlı" },
  { id: "draft", label: "Taslak" },
];

const SORT_OPTIONS: { key: ContentSortKey; label: string }[] = [
  { key: "date", label: "Tarih" },
  { key: "views", label: "Görüntülenme" },
  { key: "engagement", label: "Etkileşim" },
  { key: "title", label: "Başlık" },
];

type Props = {
  totalCount: number;
  filteredCount: number;
  filters: ContentLibraryFilters;
  viewMode: ContentViewMode;
  onQueryChange: (query: string) => void;
  onKindChange: (kind: ContentLibraryFilters["kind"]) => void;
  onStatusChange: (status: ContentLibraryFilters["status"]) => void;
  onSortChange: (sortKey: ContentSortKey, sortDir: ContentLibraryFilters["sortDir"]) => void;
  onViewModeChange: (mode: ContentViewMode) => void;
};

export function StudioContentToolbar({
  totalCount,
  filteredCount,
  filters,
  viewMode,
  onQueryChange,
  onKindChange,
  onStatusChange,
  onSortChange,
  onViewModeChange,
}: Props) {
  return (
    <div className="st-content-toolbar">
      <div className="st-content-toolbar-row">
        <div className="st-content-toolbar-meta">
          {filteredCount === totalCount
            ? `${totalCount} içerik`
            : `${filteredCount} / ${totalCount} içerik`}
        </div>
        <div className="st-content-toolbar-controls">
          <input
            type="search"
            className="st-content-search"
            placeholder="Başlık veya metin ara…"
            value={filters.query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="İçerik ara"
          />
          <select
            className="st-content-select"
            value={`${filters.sortKey}:${filters.sortDir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(":") as [ContentSortKey, ContentLibraryFilters["sortDir"]];
              onSortChange(key, dir);
            }}
            aria-label="Sıralama"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={`${opt.key}-desc`} value={`${opt.key}:desc`}>
                {opt.label} ↓
              </option>
            ))}
            {SORT_OPTIONS.map((opt) => (
              <option key={`${opt.key}-asc`} value={`${opt.key}:asc`}>
                {opt.label} ↑
              </option>
            ))}
          </select>
          <div className="st-content-view-toggle" role="group" aria-label="Görünüm">
            <button
              type="button"
              className={cn("st-content-view-btn", viewMode === "grid" && "st-content-view-btn--active")}
              onClick={() => onViewModeChange("grid")}
              aria-pressed={viewMode === "grid"}
            >
              Kart
            </button>
            <button
              type="button"
              className={cn("st-content-view-btn", viewMode === "table" && "st-content-view-btn--active")}
              onClick={() => onViewModeChange("table")}
              aria-pressed={viewMode === "table"}
            >
              Tablo
            </button>
          </div>
        </div>
      </div>

      <div className="st-content-filters">
        {KIND_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={cn("st-filter-pill", filters.kind === f.id && "st-filter-pill--active")}
            onClick={() => onKindChange(f.id)}
          >
            {f.label}
          </button>
        ))}
        <span className="st-content-filter-divider" aria-hidden />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={cn("st-filter-pill", filters.status === f.id && "st-filter-pill--active")}
            onClick={() => onStatusChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
