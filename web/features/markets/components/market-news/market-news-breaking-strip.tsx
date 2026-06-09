import Link from "next/link";

import { MarketNewsBreakingBadge } from "@/features/markets/components/market-news/market-news-breaking-badge";
import { formatNewsTimeAgo, marketNewsDetailHref } from "@/features/markets/lib/market-news-shared";
import { getNewsCardTone } from "@/features/markets/lib/news-card-tones";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  item: MarketNewsIntelligenceItem;
};

export function MarketNewsBreakingStrip({ item }: Props) {
  const tone = getNewsCardTone(item.newsCategory);

  return (
    <Link
      href={marketNewsDetailHref(item.id)}
      className={cn("mn-ch-breaking-strip", `mn-ch-breaking-strip--${tone}`)}
    >
      <MarketNewsBreakingBadge />
      <span className="mn-ch-breaking-strip__headline">{item.headline}</span>
      <span className="mn-ch-breaking-strip__meta">
        {item.source} · {formatNewsTimeAgo(item.minutesAgo)}
      </span>
      <span className="mn-ch-breaking-strip__cta" aria-hidden>
        Oku →
      </span>
    </Link>
  );
}
