"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import { CreatorAnalystHeroSpotlight } from "@/features/creators/components/creator-analyst-hero-spotlight";
import { CreatorAnalystTapeRow } from "@/features/creators/components/creator-analyst-tape-row";
import { CreatorsAnalystRailSection } from "@/features/creators/components/creators-analyst-rail-section";
import { CreatorsDirectoryLoadFooter } from "@/features/creators/components/creators-directory-load-footer";
import { CreatorsDirectoryState } from "@/features/creators/components/creators-directory-states";
import { pickHeroCreator } from "@/features/creators/lib/creator-content-mix";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { cn } from "@/lib/cn";

const DIRECTORY_PAGE_SIZE = 16;

type Props = {
  filtered: CreatorDirectoryRow[];
  featured: CreatorDirectoryRow[];
  live: CreatorDirectoryRow[];
  rising: CreatorDirectoryRow[];
  hasActiveFilters: boolean;
  refining?: boolean;
};

export function CreatorsDirectoryStream({
  filtered,
  featured,
  live,
  rising,
  hasActiveFilters,
  refining = false,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(DIRECTORY_PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setVisibleCount(DIRECTORY_PAGE_SIZE);
    setLoadingMore(false);
  }, [filtered.length, filtered[0]?.id]);

  const directoryVisible = filtered.slice(0, visibleCount);
  const directoryHasMore = visibleCount < filtered.length;

  const loadMoreDirectory = useCallback(() => {
    if (!directoryHasMore || loadingMore) return;
    setLoadingMore(true);
    setVisibleCount((n) => Math.min(n + DIRECTORY_PAGE_SIZE, filtered.length));
    setLoadingMore(false);
  }, [directoryHasMore, filtered.length, loadingMore]);

  const topByAccuracy = useMemo(
    () =>
      [...filtered]
        .filter((c) => c.signalAccuracy != null && c.signalAccuracy > 0)
        .sort((a, b) => (b.signalAccuracy ?? 0) - (a.signalAccuracy ?? 0))
        .slice(0, 8),
    [filtered],
  );

  const hero = useMemo(() => pickHeroCreator(live, featured), [live, featured]);

  if (filtered.length === 0 && featured.length === 0 && live.length === 0) {
    return <CreatorsDirectoryState variant={hasActiveFilters ? "filtered" : "empty"} />;
  }

  return (
    <div className={cn("crt-v2-stream", refining && "crt-v2-stream--refining")}>
      {hero && !hasActiveFilters ? <CreatorAnalystHeroSpotlight creator={hero} /> : null}

      <CreatorsAnalystRailSection label="Canlı" accent="live" creators={live} />

      <CreatorsAnalystRailSection label="Editör seçkisi" accent="signal" creators={featured} featured />

      <CreatorsAnalystRailSection label="Yükselen" accent="peak" creators={rising} />

      {topByAccuracy.length > 0 ? (
        <CreatorsAnalystRailSection label="İsabet liderleri" accent="signal" creators={topByAccuracy} />
      ) : null}

      <section className="crt-v2-directory" aria-label="Tüm analistler">
        <div className="crt-v2-directory__head">
          <h2 className="crt-v2-directory__title">Tüm analistler</h2>
          <span className="crt-v2-directory__count tabular-nums">{filtered.length}</span>
        </div>

        <div className="crt-v2-tape-list">
          {directoryVisible.map((c, i) => (
            <CreatorAnalystTapeRow key={c.id} creator={c} index={i} rank={i + 1} />
          ))}
        </div>

        {directoryHasMore ? (
          <>
            <InfiniteScrollSentinel enabled={!loadingMore} onVisible={loadMoreDirectory} />
            <CreatorsDirectoryLoadFooter
              loading={loadingMore}
              hasMore={directoryHasMore}
              shown={directoryVisible.length}
              total={filtered.length}
              onLoadMore={loadMoreDirectory}
            />
          </>
        ) : filtered.length > 0 ? (
          <p className="crt-v2-directory__end">Listenin sonu</p>
        ) : null}
      </section>
    </div>
  );
}
