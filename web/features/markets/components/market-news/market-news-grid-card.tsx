import Link from "next/link";

import {
  NewsCategoryBadge,
  NewsImpactBadge,
  NewsPortfolioBadge,
  NewsWatchlistBadge,
} from "@/features/markets/components/market-news/market-news-badges";
import { MarketNewsCardMedia } from "@/features/markets/components/market-news/market-news-card-media";
import { formatNewsTimeAgo, marketNewsDetailHref } from "@/features/markets/lib/market-news-shared";
import { getNewsCardTone } from "@/features/markets/lib/news-card-tones";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";

type Props = {
  item: MarketNewsIntelligenceItem & { imageUrl?: string | null };
  index?: number;
  variant?: "grid" | "rail";
};

export function MarketNewsGridCard({ item, index = 0, variant = "grid" }: Props) {
  const tone = getNewsCardTone(item.newsCategory);

  return (
    <Link
      href={marketNewsDetailHref(item.id)}
      className={cn(
        "mn-card mn-card--premium mn-card--overlay-v2 group motion-entrance",
        variant === "rail" && "mn-card--rail",
        `mn-card--tone-${tone}`,
      )}
      style={motionEntranceDelay(index)}
    >
      <MarketNewsCardMedia item={item} tone={tone} />

      <div className="mn-card-overlay-top">
        <NewsImpactBadge tier={item.impactTier} />
        <NewsCategoryBadge cat={tone} />
        {item.hitsWatchlist ? <NewsWatchlistBadge /> : null}
        {item.hitsPortfolio ? <NewsPortfolioBadge /> : null}
      </div>

      <div className="mn-card-overlay-bottom">
        {item.affectedSymbols.length > 0 ? (
          <div className="mn-card-symbols">
            {item.affectedSymbols.slice(0, 3).map((s) => (
              <span key={s} className="mn-card-sym">
                {s}
              </span>
            ))}
          </div>
        ) : null}
        <h3 className="mn-card-headline">{item.headline}</h3>
        <p className="mn-card-meta">
          <span className="mn-card-meta-src">{item.source}</span>
          <span className="mn-card-meta-sep" aria-hidden>
            ·
          </span>
          <span className="mn-card-meta-time">{formatNewsTimeAgo(item.minutesAgo)}</span>
        </p>
      </div>
    </Link>
  );
}
