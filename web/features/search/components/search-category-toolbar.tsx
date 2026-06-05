"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

import { SEARCH_TAB_LABELS } from "@/features/search/lib/search-tab-counts";
import type { SearchTabCounts, SearchTabGroupId } from "@/features/search/types";
import { cn } from "@/lib/cn";

type Props = {
  tab: SearchTabGroupId;
  counts: SearchTabCounts;
  onTabChange: (tab: SearchTabGroupId) => void;
};

function ChipCount({ n }: { n: number }) {
  return <span className="creators-page__chip-count">{n > 99 ? "99+" : n}</span>;
}

export function SearchCategoryToolbar({ tab, counts, onTabChange }: Props) {
  const visible = SEARCH_TAB_LABELS.filter(({ id }) => id === "all" || counts[id] > 0);
  const tabRefs = useRef<Partial<Record<SearchTabGroupId, HTMLButtonElement | null>>>({});

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, current: SearchTabGroupId) => {
      const order = visible.map((v) => v.id);
      const idx = order.indexOf(current);
      if (idx < 0) return;
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % order.length;
      else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + order.length) % order.length;
      else return;
      e.preventDefault();
      const next = order[nextIdx]!;
      tabRefs.current[next]?.focus();
      onTabChange(next);
    },
    [visible, onTabChange],
  );

  return (
    <div className="sch-toolbar" role="tablist" aria-label="Arama kategorileri">
      {visible.map(({ id, label }) => {
        const active = tab === id;
        const cnt = counts[id];
        return (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[id] = el;
            }}
            id={`search-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="search-results-panel"
            tabIndex={active ? 0 : -1}
            className={cn("creators-page__chip", active && "creators-page__chip--active")}
            onClick={() => onTabChange(id)}
            onKeyDown={(e) => onKeyDown(e, id)}
          >
            {label}
            {id !== "all" && cnt > 0 ? <ChipCount n={cnt} /> : null}
          </button>
        );
      })}
    </div>
  );
}
