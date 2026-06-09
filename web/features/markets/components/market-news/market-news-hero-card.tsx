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

type Item = MarketNewsIntelligenceItem & { imageUrl?: string | null };

export function MarketNewsHeroMainCard({ item, index = 0 }: { item: Item; index?: number }) {
  const tone = getNewsCardTone(item.newsCategory);
  const snippet =
    item.discussionSnippet && item.discussionSnippet !== "—"
      ? item.discussionSnippet
      : null;

  return (
    <Link
      href={marketNewsDetailHref(item.id)}
      className={cn(
        "mn-hero-main mn-card--premium mn-card--overlay-v2 group motion-entrance",
        `mn-card--tone-${tone}`,
      )}
      style={motionEntranceDelay(index)}
    >
      <MarketNewsCardMedia
        item={item}
        tone={tone}
        priority
        sizes="(max-width: 1000px) 96vw, 720px"
        className="mn-hero-main__media"
      />

      <div className="mn-card-overlay-top mn-card-overlay-top--hero">
        <span className="mn-ch-lead-kicker">Manşet</span>
        <NewsImpactBadge tier={item.impactTier} />
        <NewsCategoryBadge cat={tone} />
        {item.hitsWatchlist ? <NewsWatchlistBadge variant="hero" /> : null}
        {item.hitsPortfolio ? <NewsPortfolioBadge /> : null}
      </div>

      <div className="mn-card-overlay-bottom mn-card-overlay-bottom--hero">
        {item.affectedSymbols.length > 0 ? (
          <div className="mn-card-symbols">
            {item.affectedSymbols.slice(0, 4).map((s) => (
              <span key={s} className="mn-card-sym">
                {s}
              </span>
            ))}
          </div>
        ) : null}
        <h2 className="mn-card-headline mn-card-headline--hero">{item.headline}</h2>
        {snippet ? <p className="mn-card-dek">{snippet}</p> : null}
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

export function MarketNewsHeroSideCard({ item, index = 1 }: { item: Item; index?: number }) {
  const tone = getNewsCardTone(item.newsCategory);

  return (
    <Link
      href={marketNewsDetailHref(item.id)}
      className={cn(
        "mn-hero-side-card mn-card--premium mn-card--overlay-v2 group motion-entrance",
        `mn-card--tone-${tone}`,
      )}
      style={motionEntranceDelay(index)}
    >
      <MarketNewsCardMedia
        item={item}
        tone={tone}
        sizes="(max-width: 1000px) 46vw, 360px"
        className="mn-hero-side-card__media"
      />

      <div className="mn-card-overlay-top">
        <NewsImpactBadge tier={item.impactTier} />
        <NewsCategoryBadge cat={tone} />
      </div>

      <div className="mn-card-overlay-bottom mn-card-overlay-bottom--side">
        <h3 className="mn-card-headline mn-card-headline--side">{item.headline}</h3>
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
