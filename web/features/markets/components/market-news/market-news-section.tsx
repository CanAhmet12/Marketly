import Link from "next/link";

import { MarketNewsGridCard } from "@/features/markets/components/market-news/market-news-grid-card";
import { sortByEditorialPriority } from "@/features/markets/lib/market-news-editorial";
import { NEWS_CAT_CFG } from "@/features/markets/lib/market-news-shared";
import type { NewsCardTone } from "@/features/markets/lib/news-card-tones";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

const SECTION_PREVIEW_MAX = 6;

type Props = {
  sectionKey: NewsCardTone;
  items: readonly MarketNewsIntelligenceItem[];
  showSeeAll?: boolean;
  excludeIds?: ReadonlySet<string>;
  indexOffset?: number;
};

export function MarketNewsSection({
  sectionKey,
  items,
  showSeeAll = true,
  excludeIds,
  indexOffset = 0,
}: Props) {
  const pool = excludeIds ? items.filter((i) => !excludeIds.has(i.id)) : items;
  if (pool.length === 0) return null;

  const cfg = NEWS_CAT_CFG[sectionKey];
  const preview = sortByEditorialPriority(pool).slice(0, SECTION_PREVIEW_MAX);

  return (
    <section className={cn("mn-premium-section", `mn-premium-section--${sectionKey}`)}>
      <div className="mn-premium-section__header">
        <div className="mn-premium-section__title">
          <span
            className={`mn-premium-section__accent mn-premium-section__accent--${sectionKey}`}
            aria-hidden
          />
          <h2 className="mn-premium-section__label">{cfg.label} haberleri</h2>
          <span className="mn-premium-section__count">{pool.length}</span>
        </div>
        {showSeeAll ? (
          <Link href={`/market-news?cat=${sectionKey}`} className="mn-premium-section__link">
            Tümünü gör
          </Link>
        ) : null}
      </div>
      <div className="mn-premium-grid">
        {preview.map((item, i) => (
          <MarketNewsGridCard key={item.id} item={item} index={indexOffset + i} />
        ))}
      </div>
    </section>
  );
}
