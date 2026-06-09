"use client";

import type { KeyboardEvent, RefObject } from "react";

import { NEWS_CAT_CFG } from "@/features/markets/lib/market-news-shared";
import { NEWS_CATEGORY_ORDER } from "@/features/markets/lib/news-card-tones";
import type { MarketNewsroomBundle } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

export type NewsTabCat = keyof MarketNewsroomBundle["categoryCounts"];

type Props = {
  activeCat: NewsTabCat;
  categoryCounts: MarketNewsroomBundle["categoryCounts"];
  visibleCats: readonly (typeof NEWS_CATEGORY_ORDER)[number][];
  tabRefs: RefObject<Partial<Record<NewsTabCat, HTMLButtonElement | null>>>;
  onSelect: (cat: NewsTabCat) => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, current: NewsTabCat) => void;
};

export function MarketNewsTabs({
  activeCat,
  categoryCounts,
  visibleCats,
  tabRefs,
  onSelect,
  onKeyDown,
}: Props) {
  return (
    <div className="mn-premium-tabs" role="tablist" aria-label="Haber kategorileri">
      <button
        id="mn-tab-all"
        type="button"
        role="tab"
        aria-selected={activeCat === "all"}
        aria-controls="market-news-panel"
        tabIndex={activeCat === "all" ? 0 : -1}
        ref={(el) => {
          tabRefs.current.all = el;
        }}
        className={cn("mn-premium-tab mn-premium-tab--all", activeCat === "all" && "is-active")}
        onClick={() => onSelect("all")}
        onKeyDown={(e) => onKeyDown(e, "all")}
      >
        <span className="mn-premium-tab__label">Tümü</span>
        <span className="mn-premium-tab__count">{categoryCounts.all}</span>
      </button>

      {visibleCats.map((cat) => {
        const cfg = NEWS_CAT_CFG[cat];
        const count = categoryCounts[cat] ?? 0;
        return (
          <button
            key={cat}
            id={`mn-tab-${cat}`}
            type="button"
            role="tab"
            aria-selected={activeCat === cat}
            aria-controls="market-news-panel"
            tabIndex={activeCat === cat ? 0 : -1}
            ref={(el) => {
              tabRefs.current[cat] = el;
            }}
            className={cn(
              "mn-premium-tab",
              cfg.tabCls,
              activeCat === cat && "is-active",
            )}
            onClick={() => onSelect(cat)}
            onKeyDown={(e) => onKeyDown(e, cat)}
          >
            <span className={cn("mn-premium-tab__tone", `mn-premium-tab__tone--${cat}`)} aria-hidden />
            <span className="mn-premium-tab__label">{cfg.tabLabel}</span>
            <span className="mn-premium-tab__count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
