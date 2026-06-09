"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

import {
  SAVED_SECTION_LABELS,
  type SavedSectionId,
} from "@/features/saved/saved-section-params";
import { cn } from "@/lib/cn";

const NAV_ITEMS: SavedSectionId[] = ["all", "recent", "video", "markets"];

type Props = {
  active: SavedSectionId;
  onSelect: (id: SavedSectionId) => void;
  counts?: Partial<Record<SavedSectionId, number>>;
};

export function SavedNavRail({ active, onSelect, counts = {} }: Props) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      const len = NAV_ITEMS.length;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        focusTab((index + 1) % len);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusTab((index - 1 + len) % len);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusTab(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusTab(len - 1);
      }
    },
    [focusTab],
  );

  return (
    <nav className="sv-nav-top" aria-label="Kaydedilenler bölümleri">
      <div className="sv-nav-segment" role="tablist">
        {NAV_ITEMS.map((id, index) => {
          const on = active === id;
          const count = counts[id] ?? 0;
          const label = count > 0 ? `${SAVED_SECTION_LABELS[id]} (${count})` : SAVED_SECTION_LABELS[id];
          return (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`sv-tab-${id}`}
              aria-selected={on}
              aria-controls="sv-panel-main"
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn("sv-nav-tab", on && "sv-nav-tab--active")}
              data-tone={id}
            >
              <span className="sv-nav-tab-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
