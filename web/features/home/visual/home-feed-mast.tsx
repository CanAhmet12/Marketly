"use client";

import Link from "next/link";
import type { KeyboardEvent, RefObject } from "react";

import { HOME_FEED_CHIP_IDS, type HomeFeedChipId } from "@/features/feed/home-feed-filters";
import { HomeStoriesSection } from "@/features/stories/home-stories-section";
import { cn } from "@/lib/cn";

const TAB_LABELS: Record<HomeFeedChipId, string> = {
  for_you: "Senin için",
  following: "Takip",
};

type Props = {
  chip: HomeFeedChipId;
  feedPanelId: string;
  tabRefs: RefObject<Partial<Record<HomeFeedChipId, HTMLButtonElement>>>;
  isFetching: boolean;
  showSetupGrid: boolean;
  onSetChip: (id: HomeFeedChipId) => void;
  onTabKeyDown: (e: KeyboardEvent<HTMLButtonElement>, current: HomeFeedChipId) => void;
  onRefresh: () => void;
};

function IconRefresh({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn(spinning && "hv-ref__icon-spin")}
    >
      <path
        d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6M3 12a9 9 0 0 1 3 6.7M3 21v-6h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCompose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeFeedMast({
  chip,
  feedPanelId,
  tabRefs,
  isFetching,
  showSetupGrid,
  onSetChip,
  onTabKeyDown,
  onRefresh,
}: Props) {
  return (
    <div className="hv-ref__mast">
      <header className="hv-ref__top" aria-label="Akış">
        <span className="hv-ref__sr-only">Akış</span>
        <div className="hv-ref__mast-head">
          <div className="hv-ref__head-actions">
            <div className="hv-ref__tabs-wrap">
            <div
              className="hv-ref__tabs"
              role="tablist"
              aria-label="Akış sekmeleri — J ile sekme değiştir"
            >
              {HOME_FEED_CHIP_IDS.map((tabId) => (
                <button
                  key={tabId}
                  ref={(el) => {
                    if (tabRefs.current) tabRefs.current[tabId] = el ?? undefined;
                  }}
                  type="button"
                  role="tab"
                  id={`home-feed-tab-${tabId}`}
                  aria-selected={chip === tabId}
                  aria-controls={feedPanelId}
                  tabIndex={chip === tabId ? 0 : -1}
                  className="hv-ref__tab"
                  data-active={chip === tabId}
                  onClick={() => onSetChip(tabId)}
                  onKeyDown={(e) => onTabKeyDown(e, tabId)}
                >
                  {TAB_LABELS[tabId]}
                </button>
              ))}
            </div>
            <span className="hv-ref__tab-kbd" title="Sekme değiştir (J)" aria-hidden>J</span>
            </div>
            <div className="hv-ref__toolbar">
              <Link
                href="/upload"
                className="hv-ref__icon-btn hv-ref__icon-btn--accent hv-ref__icon-btn--compose"
                title="Gönderi oluştur (N)"
                aria-label="Gönderi oluştur — klavye kısayolu N"
              >
                <IconCompose />
                <span className="hv-ref__compose-kbd" aria-hidden>N</span>
              </Link>
              <button
                type="button"
                className="hv-ref__icon-btn hv-ref__icon-btn--refresh"
                title="Yenile (R)"
                aria-label="Yenile — klavye kısayolu R"
                aria-busy={isFetching}
                disabled={isFetching}
                onClick={onRefresh}
              >
                <IconRefresh spinning={isFetching} />
                <span className="hv-ref__refresh-kbd" aria-hidden>R</span>
              </button>
            </div>
          </div>
        </div>
        <div className="hv-ref-strip-region">
          <div className="hv-ref__stories-wrap">
            <HomeStoriesSection useStaticFallback={showSetupGrid} />
          </div>
        </div>
      </header>
    </div>
  );
}
