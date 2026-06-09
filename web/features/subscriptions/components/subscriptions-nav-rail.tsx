"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

import {
  SUBSCRIPTIONS_SECTION_LABELS,
  type SubscriptionsSectionId,
} from "@/features/subscriptions/subscriptions-section-params";
import { cn } from "@/lib/cn";

const NAV_ITEMS: { id: SubscriptionsSectionId; tone: string }[] = [
  { id: "overview", tone: "overview" },
  { id: "discover", tone: "discover" },
  { id: "active", tone: "active" },
  { id: "catalog", tone: "catalog" },
];

type Props = {
  active: SubscriptionsSectionId;
  onSelect: (id: SubscriptionsSectionId) => void;
  activeCount?: number;
};

export function SubscriptionsNavRail({ active, onSelect, activeCount = 0 }: Props) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback((index: number) => {
    const el = tabRefs.current[index];
    el?.focus();
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
    <nav className="sub-nav-top" aria-label="Üyelik bölümleri">
      <div className="sub-nav-segment" role="tablist">
        {NAV_ITEMS.map((item, index) => {
          const on = active === item.id;
          const label =
            item.id === "active" && activeCount > 0
              ? `${SUBSCRIPTIONS_SECTION_LABELS[item.id]} (${activeCount})`
              : SUBSCRIPTIONS_SECTION_LABELS[item.id];
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`sub-tab-${item.id}`}
              aria-selected={on}
              aria-controls="sub-panel-main"
              tabIndex={on ? 0 : -1}
              aria-current={on ? "page" : undefined}
              onClick={() => onSelect(item.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn("sub-nav-tab", on && "sub-nav-tab--active")}
              data-tone={item.tone}
            >
              <span className="sub-nav-tab-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
