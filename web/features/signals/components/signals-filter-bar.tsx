"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

import type { SignalFacetCounts } from "@/features/signals/lib/compute-signal-facet-counts";
import {
  SIGNAL_CHIP_OPTIONS,
  SIGNAL_DIRECTION_OPTIONS,
  SIGNAL_SORT_OPTIONS,
  signalFiltersActiveCount,
  type SignalFiltersState,
} from "@/features/signals/signals-filters";
import type { SignalDirectionFilter, SignalFilterChipId } from "@/features/signals/types";
import { cn } from "@/lib/cn";

type AnalystOpt = { id: string; label: string };

type Props = {
  filters: SignalFiltersState;
  resultCount: number;
  facetCounts: SignalFacetCounts;
  analysts: AnalystOpt[];
  onChange: (next: SignalFiltersState) => void;
  onReset: () => void;
};

function advancedActiveCount(f: SignalFiltersState): number {
  let n = 0;
  if (f.chips.size) n += f.chips.size;
  if (f.analystId !== "all") n++;
  if (f.minConfidence > 0) n++;
  return n;
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn("sp-toolbar__chip", active && "sp-toolbar__chip--active", disabled && !active && "sp-toolbar__chip--disabled")}
    >
      {children}
    </button>
  );
}

function ChipCount({ n }: { n: number }) {
  return <span className="sp-toolbar__chip-count">{n}</span>;
}

export function SignalsFilterBar({ filters, resultCount, facetCounts, analysts, onChange, onReset }: Props) {
  const activeN = signalFiltersActiveCount(filters);
  const advN = advancedActiveCount(filters);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<SignalDirectionFilter, HTMLButtonElement | null>>>({});

  const onDirectionKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, current: SignalDirectionFilter) => {
      const order = SIGNAL_DIRECTION_OPTIONS.map((o) => o.id);
      const idx = order.indexOf(current);
      if (idx < 0) return;
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % order.length;
      else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + order.length) % order.length;
      else return;
      e.preventDefault();
      for (let step = 0; step < order.length; step++) {
        const probe = (nextIdx + step) % order.length;
        const id = order[probe]!;
        const n = facetCounts.direction[id];
        const disabled = id !== "all" && n === 0 && filters.direction !== id;
        if (disabled) continue;
        tabRefs.current[id]?.focus();
        if (filters.direction !== id) onChange({ ...filters, direction: id });
        return;
      }
    },
    [facetCounts, filters, onChange],
  );

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

  const toggleChip = (id: SignalFilterChipId) => {
    const next = new Set(filters.chips);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...filters, chips: next });
  };

  return (
    <div className="sp-toolbar">
      <div className="sp-toolbar__row">
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SignalFiltersState["sort"] })}
          className="sp-toolbar__sort"
          aria-label="Sırala"
        >
          {SIGNAL_SORT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="sp-toolbar__panel-anchor" ref={panelRef}>
          <button
            type="button"
            className={cn("sp-toolbar__filter-btn", (panelOpen || advN > 0) && "sp-toolbar__filter-btn--active")}
            aria-expanded={panelOpen}
            aria-haspopup="true"
            onClick={() => setPanelOpen((v) => !v)}
          >
            Filtre
            {advN > 0 ? <span className="sp-toolbar__filter-badge">{advN}</span> : null}
          </button>

          {panelOpen ? (
            <div className="sp-toolbar__filter-panel" role="dialog" aria-label="Gelişmiş filtreler">
              <div className="sp-toolbar__panel-section">
                <span className="sp-toolbar__panel-label">Strateji & varlık</span>
                <div className="sp-toolbar__panel-chips">
                  {SIGNAL_CHIP_OPTIONS.map((o) => {
                    const n = facetCounts.chips[o.id];
                    const active = filters.chips.has(o.id);
                    const disabled = n === 0 && !active;
                    return (
                      <Chip key={o.id} active={active} disabled={disabled} onClick={() => toggleChip(o.id)}>
                        {o.label}
                        <ChipCount n={n} />
                      </Chip>
                    );
                  })}
                </div>
              </div>

              <label className="sp-toolbar__panel-field">
                <span className="sp-toolbar__panel-label">Analist</span>
                <select
                  value={filters.analystId}
                  onChange={(e) =>
                    onChange({ ...filters, analystId: e.target.value === "all" ? "all" : e.target.value })
                  }
                  className="sp-toolbar__select"
                >
                  <option value="all">Tümü</option>
                  {analysts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sp-toolbar__panel-field">
                <span className="sp-toolbar__panel-label">
                  Min. güven · <strong>{filters.minConfidence}%</strong>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={filters.minConfidence}
                  onChange={(e) => onChange({ ...filters, minConfidence: Number(e.target.value) })}
                  className="sp-toolbar__range"
                />
              </label>

              {advN > 0 ? (
                <button
                  type="button"
                  className="sp-toolbar__panel-clear"
                  onClick={() => onChange({ ...filters, chips: new Set(), analystId: "all", minConfidence: 0 })}
                >
                  Gelişmiş filtreleri temizle
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <span className="sp-toolbar__count">{resultCount}</span>

        {activeN > 0 ? (
          <button type="button" className="sp-toolbar__reset" onClick={onReset}>
            Temizle
          </button>
        ) : null}
      </div>

      <div className="sp-toolbar__tabs" role="tablist" aria-label="Sinyal yönü">
        {SIGNAL_DIRECTION_OPTIONS.map((o) => {
          const n = facetCounts.direction[o.id];
          const active = filters.direction === o.id;
          const disabled = o.id !== "all" && n === 0 && !active;
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              ref={(el) => { tabRefs.current[o.id] = el; }}
              disabled={disabled}
              className={cn(
                "sp-toolbar__tab",
                active && "sp-toolbar__tab--active",
                o.id === "buy" && active && "sp-toolbar__tab--buy",
                o.id === "sell" && active && "sp-toolbar__tab--sell",
                disabled && !active && "sp-toolbar__tab--disabled",
              )}
              onClick={() => onChange({ ...filters, direction: o.id as SignalDirectionFilter })}
              onKeyDown={(e) => onDirectionKeyDown(e, o.id)}
            >
              {o.label}
              {o.id !== "all" && n > 0 ? <span className="sp-toolbar__tab-count">{n}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
