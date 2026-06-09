"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

import {
  CREATOR_ASSET_PRESETS,
  CREATOR_SORT_OPTIONS,
  CREATOR_SPECIALTY_PRESETS,
} from "@/features/creators/lib/creators-directory-config";
import type { CreatorsDirectoryParams } from "@/features/creators/hooks/use-creators-directory-params";
import { cn } from "@/lib/cn";

type Props = {
  params: CreatorsDirectoryParams;
  onChange: (patch: Partial<CreatorsDirectoryParams>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
};

/** Kompakt filtre — tek satır, gereksiz metin yok */
export function CreatorsFilterBar({ params, onChange, onClearFilters, activeFilterCount }: Props) {
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
    <div className="crt-v2-filter">
      <div className="crt-v2-filter__row">
        <label className="crt-v2-filter__search">
          <span className="sr-only">Analist ara</span>
          <input
            type="search"
            value={draftQ}
            placeholder="Ara…"
            className="crt-v2-filter__search-input"
            onChange={(e) => setDraftQ(e.target.value)}
            onBlur={commitSearch}
            onKeyDown={onSearchKeyDown}
          />
        </label>

        <select
          className="crt-v2-filter__sort"
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
            className={cn("crt-v2-filter__filter-btn", filterOpen && "crt-v2-filter__filter-btn--open")}
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((v) => !v)}
          >
            {hasFilters ? `Filtre · ${activeFilterCount}` : "Filtre"}
          </button>
          {filterOpen ? (
            <div className="crt-v2-filter__panel" role="dialog" aria-label="Filtreler">
              <p className="crt-v2-filter__panel-label">Uzmanlık</p>
              <div className="crt-v2-filter__chip-row">
                {CREATOR_SPECIALTY_PRESETS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={cn("crt-v2-filter__chip", params.specialty === s.id && "crt-v2-filter__chip--active")}
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
          <button type="button" className="crt-v2-filter__reset" onClick={onClearFilters}>
            Sıfırla
          </button>
        ) : null}
      </div>

      <div className="crt-v2-filter__asset-scroll" role="tablist" aria-label="Varlık filtresi">
        {CREATOR_ASSET_PRESETS.map((asset) => (
          <button
            key={asset}
            type="button"
            role="tab"
            aria-selected={params.asset === asset}
            className={cn("crt-v2-filter__asset-chip", params.asset === asset && "crt-v2-filter__asset-chip--active")}
            onClick={() => onChange({ asset: params.asset === asset ? null : asset })}
          >
            {asset}
          </button>
        ))}
      </div>
    </div>
  );
}
