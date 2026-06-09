import Link from "next/link";

import {
  NewsCategoryBadge,
  NewsImpactBadge,
} from "@/features/markets/components/market-news/market-news-badges";
import { MarketNewsCardMedia } from "@/features/markets/components/market-news/market-news-card-media";
import { formatNewsTimeAgo, marketNewsDetailHref } from "@/features/markets/lib/market-news-shared";
import { getNewsCardTone } from "@/features/markets/lib/news-card-tones";
import type { MarketNewsDetailItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  item: MarketNewsDetailItem;
};

export function MarketNewsDetailRelatedCard({ item }: Props) {
  const tone = getNewsCardTone(item.newsCategory);

  return (
    <Link
      href={marketNewsDetailHref(item.id)}
      className={cn(
        "mnd-related-card mnd-related-card--premium group",
        `mn-card--tone-${tone}`,
      )}
    >
      <div className="mnd-related-card__media">
        <MarketNewsCardMedia
          item={item}
          tone={tone}
          sizes="144px"
          className="mnd-related-card__media-inner"
        />
      </div>
      <div className="mnd-related-card__body">
        <div className="mnd-related-card__badges">
          <NewsImpactBadge tier={item.impactTier} />
          <NewsCategoryBadge cat={tone} />
        </div>
        <p className="mnd-related-card__headline">{item.headline}</p>
        <p className="mnd-related-card__meta">
          <span>{item.source}</span>
          <span aria-hidden>·</span>
          <span>{formatNewsTimeAgo(item.minutesAgo)}</span>
        </p>
      </div>
    </Link>
  );
}
