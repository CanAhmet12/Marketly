"use client";

import type { SignalFacetCounts } from "@/features/signals/lib/compute-signal-facet-counts";
import { SIGNAL_MARKET_SECTIONS } from "@/features/signals/components/signals-market-sections";
import {
  SIGNAL_SORT_OPTIONS,
  signalFiltersActiveCount,
  type SignalFiltersState,
} from "@/features/signals/signals-filters";
import type { SignalsFeedScope } from "@/features/signals/fetch-signals-feed";
import type { MarketAssetCategory } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  filters: SignalFiltersState;
  resultCount: number;
  facetCounts: SignalFacetCounts;
  scope: SignalsFeedScope;
  archiveCount?: number;
  onScopeChange: (scope: SignalsFeedScope) => void;
  onChange: (next: SignalFiltersState) => void;
  onReset: () => void;
  onSelectMarket: (category: MarketAssetCategory | "all") => void;
  activeMarket: MarketAssetCategory | "all";
};

export function SignalsFilterBar({
  filters,
  resultCount,
  facetCounts,
  scope,
  archiveCount = 0,
  onScopeChange,
  onChange,
  onReset,
  onSelectMarket,
  activeMarket,
}: Props) {
  const activeN = signalFiltersActiveCount(filters);

  return (
    <div className="sp-toolbar sp-toolbar--v2 sp-toolbar--segments-bottom">
      <div className="sp-toolbar__row">
        <div className="sp-toolbar__scope" role="tablist" aria-label="Katalog görünümü">
          <button
            type="button"
            role="tab"
            aria-selected={scope === "live"}
            className={cn("sp-toolbar__scope-btn", scope === "live" && "sp-toolbar__scope-btn--active")}
            onClick={() => onScopeChange("live")}
          >
            Aktif
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={scope === "archive"}
            className={cn("sp-toolbar__scope-btn", scope === "archive" && "sp-toolbar__scope-btn--active")}
            onClick={() => onScopeChange("archive")}
          >
            Arşiv{archiveCount > 0 ? ` (${archiveCount})` : ""}
          </button>
        </div>

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

        <span className="sp-toolbar__count">{resultCount}</span>

        {activeN > 0 ? (
          <button type="button" className="sp-toolbar__reset" onClick={onReset}>
            Temizle
          </button>
        ) : null}
      </div>

      <div className="sp-segment-nav sp-segment-nav--market" role="tablist" aria-label="Piyasa segmenti">
        <div className="sp-segment-nav__track">
          <button
            type="button"
            role="tab"
            aria-selected={activeMarket === "all"}
            className={cn("sp-segment-nav__item", activeMarket === "all" && "sp-segment-nav__item--active")}
            onClick={() => onSelectMarket("all")}
          >
            <span className="sp-segment-nav__dot sp-segment-nav__dot--all" aria-hidden />
            <span className="sp-segment-nav__label">Tümü</span>
          </button>
          {SIGNAL_MARKET_SECTIONS.map((section) => {
            const n = facetCounts.chips[section.id] ?? 0;
            const active = activeMarket === section.id;
            const disabled = n === 0 && !active;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={disabled}
                className={cn(
                  "sp-segment-nav__item",
                  `sp-segment-nav__item--${section.tone}`,
                  active && "sp-segment-nav__item--active",
                  disabled && !active && "sp-segment-nav__item--disabled",
                )}
                onClick={() => onSelectMarket(section.id)}
              >
                <span className={cn("sp-segment-nav__dot", `sp-segment-nav__dot--${section.tone}`)} aria-hidden />
                <span className="sp-segment-nav__label">{section.label.replace(" Sinyalleri", "")}</span>
                {n > 0 ? <span className="sp-segment-nav__count">{n}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
