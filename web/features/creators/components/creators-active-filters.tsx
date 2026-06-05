"use client";

import type { CreatorFilters } from "@/features/creators/creators-filters";
import {
  CREATOR_FORMAT_OPTIONS,
  CREATOR_SORT_OPTIONS,
  CREATOR_TIER_OPTIONS,
  DEFAULT_CREATOR_FILTERS,
} from "@/features/creators/creators-filters";

type Props = {
  filters: CreatorFilters;
  onChange: (next: CreatorFilters) => void;
  onReset: () => void;
};

type ActiveItem = { id: string; label: string; next: CreatorFilters };

function buildActiveItems(filters: CreatorFilters): ActiveItem[] {
  const items: ActiveItem[] = [];

  if (filters.q.trim()) {
    items.push({ id: "q", label: filters.q.trim(), next: { ...filters, q: "" } });
  }
  if (filters.format !== "all") {
    const label = CREATOR_FORMAT_OPTIONS.find((o) => o.id === filters.format)?.label ?? filters.format;
    items.push({ id: "format", label, next: { ...filters, format: "all" } });
  }
  if (filters.asset) {
    items.push({ id: "asset", label: filters.asset, next: { ...filters, asset: null } });
  }
  if (filters.tier !== "all") {
    const label = CREATOR_TIER_OPTIONS.find((o) => o.id === filters.tier)?.label ?? filters.tier;
    items.push({ id: "tier", label, next: { ...filters, tier: "all" } });
  }
  if (filters.scope === "following") {
    items.push({ id: "scope", label: "Takip", next: { ...filters, scope: "all" } });
  }
  if (filters.sort !== "recommended") {
    const label = CREATOR_SORT_OPTIONS.find((o) => o.id === filters.sort)?.label ?? filters.sort;
    items.push({ id: "sort", label, next: { ...filters, sort: DEFAULT_CREATOR_FILTERS.sort } });
  }

  return items;
}

/** İnce satır — modal kutu yok, toolbar altına yapışık. */
export function CreatorsActiveFilters({ filters, onChange, onReset }: Props) {
  const items = buildActiveItems(filters);
  if (!items.length) return null;

  return (
    <div className="creators-page__active-row" role="region" aria-label="Aktif filtreler">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="creators-page__active-pill"
          onClick={() => onChange(item.next)}
          aria-label={`${item.label} filtresini kaldır`}
        >
          {item.label}
          <span className="creators-page__active-x" aria-hidden>
            ×
          </span>
        </button>
      ))}
      {items.length > 1 ? (
        <button type="button" className="creators-page__active-clear" onClick={onReset}>
          Tümü
        </button>
      ) : null}
    </div>
  );
}
