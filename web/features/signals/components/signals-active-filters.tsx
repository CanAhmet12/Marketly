"use client";

import {
  DEFAULT_SIGNAL_FILTERS,
  SIGNAL_CHIP_OPTIONS,
  SIGNAL_DIRECTION_OPTIONS,
  SIGNAL_SORT_OPTIONS,
  type SignalFiltersState,
} from "@/features/signals/signals-filters";

type Props = {
  filters: SignalFiltersState;
  focusAsset?: string | null;
  onChange: (next: SignalFiltersState) => void;
  onClearFocusAsset: () => void;
  onReset: () => void;
};

type ActiveItem = { id: string; label: string; next: SignalFiltersState };

function buildActiveItems(filters: SignalFiltersState, focusAsset?: string | null): ActiveItem[] {
  const items: ActiveItem[] = [];

  if (focusAsset?.trim()) {
    items.push({
      id: "asset",
      label: focusAsset.trim().toUpperCase(),
      next: filters,
    });
  }

  if (filters.direction !== "all") {
    const label = SIGNAL_DIRECTION_OPTIONS.find((o) => o.id === filters.direction)?.label ?? filters.direction;
    items.push({ id: "direction", label, next: { ...filters, direction: "all" } });
  }

  for (const chipId of filters.chips) {
    const label = SIGNAL_CHIP_OPTIONS.find((o) => o.id === chipId)?.label ?? chipId;
    const nextChips = new Set(filters.chips);
    nextChips.delete(chipId);
    items.push({ id: `chip-${chipId}`, label, next: { ...filters, chips: nextChips } });
  }

  if (filters.analystId !== "all") {
    items.push({ id: "analyst", label: "Analist", next: { ...filters, analystId: "all" } });
  }

  if (filters.minConfidence > 0) {
    items.push({
      id: "conf",
      label: `≥%${filters.minConfidence}`,
      next: { ...filters, minConfidence: 0 },
    });
  }

  if (filters.sort !== "latest") {
    const label = SIGNAL_SORT_OPTIONS.find((o) => o.id === filters.sort)?.label ?? filters.sort;
    items.push({ id: "sort", label: `Sıra: ${label}`, next: { ...filters, sort: DEFAULT_SIGNAL_FILTERS.sort } });
  }

  return items;
}

export function SignalsActiveFilters({ filters, focusAsset, onChange, onClearFocusAsset, onReset }: Props) {
  const items = buildActiveItems(filters, focusAsset);
  if (!items.length) return null;

  return (
    <div className="sp-active-row" role="region" aria-label="Aktif filtreler">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="sp-active-pill"
          onClick={() => {
            if (item.id === "asset") {
              onClearFocusAsset();
              return;
            }
            onChange(item.next);
          }}
          aria-label={`${item.label} filtresini kaldır`}
        >
          {item.label}
          <span className="sp-active-x" aria-hidden>
            ×
          </span>
        </button>
      ))}
      {items.length > 1 ? (
        <button type="button" className="sp-active-clear" onClick={onReset}>
          Tümü
        </button>
      ) : null}
    </div>
  );
}
