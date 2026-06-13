"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

import {
  CREATOR_ASSET_PRESETS,
  CREATOR_SORT_OPTIONS,
  CREATOR_SPECIALTY_PRESETS,
  CREATOR_VIEW_TABS,
} from "@/features/creators/lib/creators-directory-config";
import type { CreatorsDirectoryParams } from "@/features/creators/hooks/use-creators-directory-params";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type Props = {
  params: CreatorsDirectoryParams;
  resultCount: number;
  liveCount: number;
  onChange: (patch: Partial<CreatorsDirectoryParams>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
};

/** Zone 3 — görünüm sekmeleri, arama, sıralama ve varlık/uzmanlık filtreleri */
export function CreatorsNavChips({ params, resultCount, liveCount, onChange, onClearFilters, activeFilterCount }: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftQ, setDraftQ] = useState(params.q);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftQ(params.q);
  }, [params.q]);

  useEffect(() => {
    if (!filterOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [filterOpen]);

  const commitSearch = useCallback(() => {
    onChange({ q: draftQ.trim() });
  }, [draftQ, onChange]);

  const onSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") commitSearch();
    },
    [commitSearch],
  );

  const hasFilters = activeFilterCount > 0;

  return (
    <nav className="crt-canvas__nav" aria-label="Üretici filtreleri">
      <div className="crt-canvas__nav-meta">
        <span className="crt-canvas__nav-count tabular-nums">{resultCount} sonuç</span>
        {liveCount > 0 ? (
          <span className="crt-canvas__nav-live">
            <span className="crt-canvas__nav-live-dot" aria-hidden />
            {formatCompactCount(liveCount)} canlı
          </span>
        ) : null}
      </div>

      <div className="crt-canvas__nav-tabs" role="tablist" aria-label="Görünüm">
        {CREATOR_VIEW_TABS.map((tab) => {
          const active = params.tab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn("crt-canvas__nav-tab", active && "crt-canvas__nav-tab--active")}
              onClick={() => onChange({ tab: tab.id })}
            >
              {"liveDot" in tab && tab.liveDot ? (
                <span className="crt-canvas__nav-tab-dot" aria-hidden />
              ) : null}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="crt-canvas__nav-tools">
        <label className="crt-canvas__search">
          <span className="sr-only">Analist ara</span>
          <input
            type="search"
            value={draftQ}
            placeholder="İsim, sembol veya uzmanlık…"
            className="crt-canvas__search-input"
            onChange={(e) => setDraftQ(e.target.value)}
            onBlur={commitSearch}
            onKeyDown={onSearchKeyDown}
          />
        </label>

        <select
          className="crt-canvas__sort"
          value={params.sort}
          aria-label="Sıralama"
          onChange={(e) => onChange({ sort: e.target.value as CreatorsDirectoryParams["sort"] })}
        >
          {CREATOR_SORT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="relative shrink-0" ref={panelRef}>
          <button
            type="button"
            className={cn("crt-canvas__filter-btn", filterOpen && "crt-canvas__filter-btn--open")}
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((v) => !v)}
          >
            {hasFilters ? `Filtre · ${activeFilterCount}` : "Uzmanlık"}
          </button>
          {filterOpen ? (
            <div className="crt-canvas__filter-panel" role="dialog" aria-label="Uzmanlık filtreleri">
              <p className="crt-canvas__filter-label">Uzmanlık alanı</p>
              <div className="crt-canvas__filter-chips">
                {CREATOR_SPECIALTY_PRESETS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={cn(
                      "crt-canvas__filter-chip",
                      params.specialty === s.id && "crt-canvas__filter-chip--active",
                    )}
                    onClick={() => onChange({ specialty: params.specialty === s.id ? null : s.id })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {hasFilters ? (
          <button type="button" className="crt-canvas__reset-btn" onClick={onClearFilters}>
            Sıfırla
          </button>
        ) : null}
      </div>

      <div className="crt-canvas__asset-scroll" role="tablist" aria-label="Varlık filtresi">
        {CREATOR_ASSET_PRESETS.map((asset) => (
          <button
            key={asset}
            type="button"
            role="tab"
            aria-selected={params.asset === asset}
            className={cn("crt-canvas__asset-chip", params.asset === asset && "crt-canvas__asset-chip--active")}
            onClick={() => onChange({ asset: params.asset === asset ? null : asset })}
          >
            {asset}
          </button>
        ))}
      </div>
    </nav>
  );
}
