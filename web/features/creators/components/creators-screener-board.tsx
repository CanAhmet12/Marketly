"use client";

import { useCallback, useEffect, useState } from "react";

import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import { CreatorsDirectoryLoadFooter } from "@/features/creators/components/creators-directory-load-footer";
import { CreatorsScreenerRow } from "@/features/creators/components/creators-screener-row";
import type { CreatorsViewTab } from "@/features/creators/lib/creators-directory-config";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 16;

const SECTION_TITLES: Record<CreatorsViewTab, string> = {
  all: "Tüm analistler",
  live: "Canlı analistler",
  editor: "Editör seçkisi",
  rising: "Yükselen analistler",
  accuracy: "İsabet liderleri",
};

type Props = {
  rows: CreatorDirectoryRow[];
  activeTab: CreatorsViewTab;
  refining?: boolean;
};

/** Analist dizini — editorial feed (HTML tablo yok) */
export function CreatorsScreenerBoard({ rows, activeTab, refining = false }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setLoadingMore(false);
  }, [rows.length, rows[0]?.id, activeTab]);

  const visible = rows.slice(0, visibleCount);
  const hasMore = visibleCount < rows.length;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setVisibleCount((n) => Math.min(n + PAGE_SIZE, rows.length));
    setLoadingMore(false);
  }, [hasMore, rows.length, loadingMore]);

  const title = SECTION_TITLES[activeTab];

  return (
    <section
      className={cn("crt-canvas__screener crt-canvas__screener-zone", refining && "crt-canvas__screener--refining")}
      aria-label={title}
    >
      <header className="crt-canvas__screener-zone-head">
        <div>
          <span className="crt-canvas__screener-kicker">Directory</span>
          <h2 className="crt-canvas__screener-title">{title}</h2>
        </div>
        <span className="crt-canvas__screener-badge tabular-nums">{rows.length} analist</span>
      </header>

      {rows.length === 0 ? (
        <div className="crt-canvas__screener-empty" role="status">
          <p className="crt-canvas__screener-empty-title">Liste boş</p>
          <p className="crt-canvas__screener-empty-desc">Bu görünümde gösterilecek analist bulunamadı.</p>
        </div>
      ) : (
        <div className="crt-canvas__dir-feed" role="list">
          {visible.map((creator, i) => (
            <CreatorsScreenerRow key={creator.id} creator={creator} rank={i + 1} index={i} />
          ))}
        </div>
      )}

      {rows.length > 0 && hasMore ? (
        <>
          <InfiniteScrollSentinel enabled={!loadingMore} onVisible={loadMore} />
          <CreatorsDirectoryLoadFooter
            loading={loadingMore}
            hasMore={hasMore}
            shown={visible.length}
            total={rows.length}
            onLoadMore={loadMore}
          />
        </>
      ) : rows.length > 0 ? (
        <p className="crt-canvas__screener-end">Listenin sonu</p>
      ) : null}
    </section>
  );
}
