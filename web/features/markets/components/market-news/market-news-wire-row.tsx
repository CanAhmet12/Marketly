import Link from "next/link";

import {
  NEWS_CAT_CFG,
  formatNewsTimeAgo,
  marketNewsDetailHref,
} from "@/features/markets/lib/market-news-shared";
import { getNewsCardTone } from "@/features/markets/lib/news-card-tones";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  item: MarketNewsIntelligenceItem;
  rank?: number;
  compact?: boolean;
};

export function MarketNewsWireRow({ item, rank, compact = false }: Props) {
  const tone = getNewsCardTone(item.newsCategory);
  const cfg = NEWS_CAT_CFG[tone];

  return (
    <Link
      href={marketNewsDetailHref(item.id)}
      className={cn("mn-ch-wire-row", compact && "mn-ch-wire-row--compact")}
    >
      {rank != null ? (
        <span className="mn-ch-wire-row__rank" aria-hidden>
          {String(rank).padStart(2, "0")}
        </span>
      ) : (
        <span className={cn("mn-ch-wire-row__dot", `mn-ch-wire-row__dot--${tone}`)} aria-hidden />
      )}
      <span className="mn-ch-wire-row__body">
        <span className="mn-ch-wire-row__meta">
          <span className={cn("mn-ch-wire-row__cat", `mn-ch-wire-row__cat--${tone}`)}>
            {cfg.shortLabel}
          </span>
          <span className="mn-ch-wire-row__time">{formatNewsTimeAgo(item.minutesAgo)}</span>
          <span className="mn-ch-wire-row__src">{item.source}</span>
        </span>
        <span className="mn-ch-wire-row__headline">{item.headline}</span>
      </span>
      {item.impactTier >= 3 ? (
        <span className="mn-ch-wire-row__flag" aria-label="Yüksek etki">
          !
        </span>
      ) : null}
    </Link>
  );
}
