"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

import {
  CLOSE_FRIENDS_SECTION_LABELS,
  type CloseFriendsSectionId,
} from "@/features/close-friends/close-friends-section-params";
import { cn } from "@/lib/cn";

const NAV_ITEMS: { id: CloseFriendsSectionId; tone: string }[] = [
  { id: "overview", tone: "overview" },
  { id: "circles", tone: "circles" },
  { id: "discover", tone: "discover" },
  { id: "feed", tone: "feed" },
];

type Props = {
  active: CloseFriendsSectionId;
  onSelect: (id: CloseFriendsSectionId) => void;
  circleCount?: number;
};

export function CloseFriendsNavRail({ active, onSelect, circleCount = 0 }: Props) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        focusTab((index + 1) % NAV_ITEMS.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusTab((index - 1 + NAV_ITEMS.length) % NAV_ITEMS.length);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusTab(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusTab(NAV_ITEMS.length - 1);
      }
    },
    [focusTab],
  );

  return (
    <nav className="cf-nav-top" aria-label="Yakın arkadaşlar bölümleri">
      <div className="cf-nav-segment" role="tablist">
        {NAV_ITEMS.map((item, index) => {
          const on = active === item.id;
          const label =
            item.id === "circles" && circleCount > 0
              ? `${CLOSE_FRIENDS_SECTION_LABELS[item.id]} (${circleCount})`
              : CLOSE_FRIENDS_SECTION_LABELS[item.id];
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`cf-tab-${item.id}`}
              aria-selected={on}
              aria-controls="cf-panel-main"
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(item.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn("cf-nav-tab", on && "cf-nav-tab--active")}
              data-tone={item.tone}
            >
              <span className="cf-nav-tab-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
