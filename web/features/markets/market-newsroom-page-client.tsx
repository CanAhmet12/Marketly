"use client";

import { useCallback, useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/states";
import { MarketNewsBreakingStrip } from "@/features/markets/components/market-news/market-news-breaking-strip";
import { MarketNewsDeskRail } from "@/features/markets/components/market-news/market-news-desk-rail";
import { MarketNewsHeader } from "@/features/markets/components/market-news/market-news-header";
import { MarketNewsTicker } from "@/features/markets/components/market-news/market-news-ticker";
import { MarketNewsWireFeed } from "@/features/markets/components/market-news/market-news-wire-feed";
import { pickBreakingLead, pickWireHeadlines } from "@/features/markets/lib/market-news-channel";
import {
  MarketNewsHeroMainCard,
  MarketNewsHeroSideCard,
} from "@/features/markets/components/market-news/market-news-hero-card";
import { MarketNewsPersonalBand } from "@/features/markets/components/market-news/market-news-personal-band";
import { MarketNewsPersonalizedRail } from "@/features/markets/components/market-news/market-news-personalized-rail";
import { MarketNewsSection } from "@/features/markets/components/market-news/market-news-section";
import {
  MarketNewsTabs,
  type NewsTabCat,
} from "@/features/markets/components/market-news/market-news-tabs";
import { MarketNewsPageSkeleton } from "@/features/markets/components/markets-states";
import { pickHeroStack } from "@/features/markets/lib/market-news-editorial";
import { NEWS_CATEGORY_ORDER } from "@/features/markets/lib/news-card-tones";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { useMarketNewsroom } from "@/features/markets/hooks/use-market-newsroom";
import { cn } from "@/lib/cn";
function resolveNewsCat(raw: string | null): NewsTabCat {
  if (!raw || raw === "all") return "all";
  if ((NEWS_CATEGORY_ORDER as readonly string[]).includes(raw)) return raw as NewsTabCat;
  return "all";
}

export function MarketNewsroomPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bundle, isLoading, isEmpty, liveMode, isRefetching } = useMarketNewsroom();
  const tabRefs = useRef<Partial<Record<NewsTabCat, HTMLButtonElement | null>>>({});

  const activeCat = useMemo(() => resolveNewsCat(searchParams.get("cat")), [searchParams]);

  const pushCat = useCallback(
    (cat: NewsTabCat) => {
      if (cat === "all") {
        router.replace("/market-news", { scroll: false });
      } else {
        router.replace(`/market-news?cat=${cat}`, { scroll: false });
      }
    },
    [router],
  );

  useEffect(() => {
    if (!bundle || activeCat === "all") return;
    if ((bundle.categoryCounts[activeCat] ?? 0) === 0) {
      pushCat("all");
    }
  }, [bundle, activeCat, pushCat]);

  const editorial = useMemo(() => {
    if (!bundle) return null;

    const allItems = [...bundle.items];
    const visibleCats = NEWS_CATEGORY_ORDER.filter(
      (cat) => (bundle.categoryCounts[cat] ?? 0) > 0,
    );
    const tabOrder: NewsTabCat[] = ["all", ...visibleCats];

    const filteredItems =
      activeCat === "all"
        ? allItems
        : allItems.filter((i) => i.newsCategory === activeCat);

    const heroSideCount = activeCat === "all" ? 2 : 3;
    const { main: heroMain, side: heroSide } = pickHeroStack(filteredItems, heroSideCount);

    const watchlistHits = allItems.filter((i) => i.hitsWatchlist).length;
    const portfolioHits = allItems.filter((i) => i.hitsPortfolio).length;

    return {
      allItems,
      visibleCats,
      tabOrder,
      filteredItems,
      heroMain,
      heroSide,
      watchlistHits,
      portfolioHits,
    };
  }, [bundle, activeCat]);

  if (isLoading || !bundle || !editorial) {
    return <MarketNewsPageSkeleton />;
  }

  if (isEmpty) {
    return (
      <div className="mn-page mn-page--premium ms-page-wrapper ms-container-markets min-w-0">
        <MarketNewsHeader showLive={liveMode} isRefetching={isRefetching} />
        <div className="py-16">
        <EmptyState
          title="Haber akışı boş"
          description="market_news tablosunda henüz kayıt yok. fetch-market-news Edge Function çalıştırıldığında haberler burada görünecek."
          actionLabel="Piyasalar"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
          compact
        />
        </div>
      </div>
    );
  }

  const { heroMain, heroSide, filteredItems, visibleCats, tabOrder, watchlistHits, portfolioHits } =
    editorial;

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, current: NewsTabCat) => {
    const idx = tabOrder.indexOf(current);
    if (idx < 0) return;
    let nextIdx = idx;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabOrder.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + tabOrder.length) % tabOrder.length;
    else return;
    e.preventDefault();
    const next = tabOrder[nextIdx]!;
    tabRefs.current[next]?.focus();
    pushCat(next);
  };

  const gridOverflow =
    activeCat !== "all" && filteredItems.length > 1 + heroSide.length
      ? filteredItems.slice(1 + heroSide.length)
      : [];

  const heroIds = new Set(
    [heroMain?.id, ...heroSide.map((item) => item.id)].filter(Boolean) as string[],
  );
  const breakingLead = pickBreakingLead(filteredItems);
  const tickerItems = pickWireHeadlines(editorial.allItems, 8, heroIds);

  return (
    <div
      className={cn(
        "mn-page mn-page--premium mn-page--channel ms-page-wrapper ms-container-markets min-w-0",
        activeCat !== "all" && `mn-page--ambient-${activeCat}`,
      )}
    >
      <MarketNewsHeader showLive={liveMode} isRefetching={isRefetching} />
      <MarketNewsTicker items={tickerItems} />
      {breakingLead && breakingLead.id !== heroMain?.id ? (
        <MarketNewsBreakingStrip item={breakingLead} />
      ) : null}

      <MarketNewsPersonalBand
        headline={bundle.personalizedHeadline}
        watchlistHits={watchlistHits}
        portfolioHits={portfolioHits}
      />

      <MarketNewsTabs
        activeCat={activeCat}
        categoryCounts={bundle.categoryCounts}
        visibleCats={visibleCats}
        tabRefs={tabRefs}
        onSelect={pushCat}
        onKeyDown={onTabKeyDown}
      />

      <div id="market-news-panel" role="tabpanel" aria-labelledby={`mn-tab-${activeCat}`}>
        {activeCat !== "all" && filteredItems.length === 0 ? (
          <EmptyState
            title="Bu kategoride haber yok"
            description="Seçili kategoride şu an haber bulunmuyor."
            actionLabel="Tüm haberler"
            onAction={() => pushCat("all")}
            tone="market"
            compact
          />
        ) : heroMain ? (
          <div className="mn-ch-desk">
            <div className="mn-ch-desk__main">
              <div className={heroSide.length > 0 ? "mn-hero" : "mn-hero mn-hero--solo"}>
                <MarketNewsHeroMainCard item={heroMain} index={0} />
                {heroSide.length > 0 ? (
                  <div className="mn-hero-side">
                    {heroSide.map((item, i) => (
                      <MarketNewsHeroSideCard key={item.id} item={item} index={i + 1} />
                    ))}
                  </div>
                ) : null}
              </div>

              {activeCat === "all" ? (
                <MarketNewsWireFeed items={editorial.allItems} excludeIds={heroIds} />
              ) : null}

              {activeCat === "all" ? (
                <MarketNewsPersonalizedRail
                  items={editorial.allItems}
                  excludeIds={heroIds}
                />
              ) : null}

              {activeCat === "all" ? (
                NEWS_CATEGORY_ORDER.map((cat, sectionIndex) => (
                  <MarketNewsSection
                    key={cat}
                    sectionKey={cat}
                    items={editorial.allItems.filter((i) => i.newsCategory === cat)}
                    excludeIds={heroIds}
                    indexOffset={sectionIndex * 2}
                  />
                ))
              ) : gridOverflow.length > 0 ? (
                <MarketNewsSection
                  sectionKey={activeCat as (typeof NEWS_CATEGORY_ORDER)[number]}
                  items={gridOverflow}
                  showSeeAll={false}
                  indexOffset={4}
                />
              ) : null}
            </div>

            <MarketNewsDeskRail
              items={editorial.allItems}
              categoryCounts={bundle.categoryCounts}
              excludeIds={heroIds}
              activeCat={activeCat}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
