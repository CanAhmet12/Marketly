"use client";

import { useEffect, useRef, useState } from "react";

import type { CreatorFilters } from "@/features/creators/creators-filters";
import {
  CREATOR_ASSET_PRESETS,
  CREATOR_FORMAT_OPTIONS,
  CREATOR_SORT_OPTIONS,
  CREATOR_TIER_OPTIONS,
  DEFAULT_CREATOR_FILTERS,
  creatorFiltersActiveCount,
} from "@/features/creators/creators-filters";
import type { CreatorFacetCounts } from "@/features/creators/lib/compute-facet-counts";
import { cn } from "@/lib/cn";

type Props = {
  filters: CreatorFilters;
  resultCount: number;
  facetCounts: CreatorFacetCounts;
  onChange: (next: CreatorFilters) => void;
  onReset: () => void;
};

function advancedActiveCount(filters: CreatorFilters): number {
  let n = 0;
  if (filters.asset) n++;
  if (filters.tier !== "all") n++;
  return n;
}

function Chip({
  active,
  disabled,
  onClick,
  children,
  className,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "creators-page__chip",
        active && "creators-page__chip--active",
        disabled && !active && "creators-page__chip--disabled",
        className,
      )}
    >
      {children}
    </button>
  );
}

function ChipCount({ n }: { n: number }) {
  return <span className="creators-page__chip-count">{n}</span>;
}

export function CreatorsFilterBar({ filters, resultCount, facetCounts, onChange, onReset }: Props) {
  const activeN = creatorFiltersActiveCount(filters);
  const advN = advancedActiveCount(filters);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [panelOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="creators-page__toolbar">
      <div className="creators-page__toolbar-row">
        <div className="creators-page__toolbar-search-wrap">
          <input
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ ...filters, q: e.target.value })}
            placeholder="Ara…"
            className="creators-page__search"
            aria-label="Üretici ara"
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>

        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as CreatorFilters["sort"] })}
          className="creators-page__sort"
          aria-label="Sırala"
        >
          {CREATOR_SORT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>

        <Chip
          active={filters.scope === "following"}
          disabled={facetCounts.scopeFollowing === 0 && filters.scope !== "following"}
          onClick={() => onChange({ ...filters, scope: filters.scope === "following" ? "all" : "following" })}
          className="creators-page__chip--ghost"
        >
          Takip
          <ChipCount n={facetCounts.scopeFollowing} />
        </Chip>

        <div className="creators-page__toolbar-panel-anchor" ref={panelRef}>
          <button
            type="button"
            className={cn("creators-page__filter-btn", (panelOpen || advN > 0) && "creators-page__filter-btn--active")}
            aria-expanded={panelOpen}
            aria-haspopup="true"
            onClick={() => setPanelOpen((v) => !v)}
          >
            Filtre
            {advN > 0 ? <span className="creators-page__filter-badge">{advN}</span> : null}
          </button>

          {panelOpen ? (
            <div className="creators-page__filter-panel" role="dialog" aria-label="Gelişmiş filtreler">
              <div className="creators-page__filter-panel-section">
                <span className="creators-page__filter-panel-label">Varlık</span>
                <div className="creators-page__filter-panel-chips">
                  {CREATOR_ASSET_PRESETS.map((asset) => {
                    const n = facetCounts.asset[asset] ?? 0;
                    const active = filters.asset === asset;
                    const disabled = n === 0 && !active;
                    return (
                      <Chip
                        key={asset}
                        active={active}
                        disabled={disabled}
                        onClick={() => onChange({ ...filters, asset: active ? null : asset })}
                      >
                        {asset}
                        <ChipCount n={n} />
                      </Chip>
                    );
                  })}
                </div>
              </div>
              <div className="creators-page__filter-panel-section">
                <span className="creators-page__filter-panel-label">Tier</span>
                <div className="creators-page__filter-panel-chips">
                  {CREATOR_TIER_OPTIONS.filter((o) => o.id !== "all").map((o) => {
                    const n = facetCounts.tier[o.id];
                    const active = filters.tier === o.id;
                    const disabled = n === 0 && !active;
                    return (
                      <Chip
                        key={o.id}
                        active={active}
                        disabled={disabled}
                        onClick={() => onChange({ ...filters, tier: active ? "all" : o.id })}
                      >
                        {o.label}
                        <ChipCount n={n} />
                      </Chip>
                    );
                  })}
                </div>
              </div>
              {advN > 0 ? (
                <button
                  type="button"
                  className="creators-page__filter-panel-clear"
                  onClick={() => onChange({ ...filters, asset: null, tier: "all" })}
                >
                  Gelişmiş filtreleri temizle
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <span className="creators-page__toolbar-count">{resultCount}</span>

        {activeN > 0 ? (
          <button type="button" className="creators-page__toolbar-reset" onClick={onReset}>
            Temizle
          </button>
        ) : null}
      </div>

      <div className="creators-page__toolbar-tabs" role="tablist" aria-label="İçerik formatı">
        {CREATOR_FORMAT_OPTIONS.map((o) => {
          const n = facetCounts.format[o.id];
          const active = filters.format === o.id;
          const disabled = o.id !== "all" && n === 0 && !active;
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              className={cn(
                "creators-page__tab",
                active && "creators-page__tab--active",
                disabled && !active && "creators-page__tab--disabled",
              )}
              onClick={() => onChange({ ...filters, format: o.id })}
            >
              {o.label}
              {o.id !== "all" && n > 0 ? <span className="creators-page__tab-count">{n}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
