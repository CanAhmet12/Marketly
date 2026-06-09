import Link from "next/link";

import { formatNewsTimeAgo, marketNewsDetailHref } from "@/features/markets/lib/market-news-shared";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";

type Props = {
  items: readonly MarketNewsIntelligenceItem[];
};

export function MarketNewsTicker({ items }: Props) {
  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="mn-ch-ticker" role="region" aria-label="Canlı haber bandı">
      <div className="mn-ch-ticker__label">
        <span className="mn-ch-ticker__dot" aria-hidden />
        CANLI
      </div>
      <div className="mn-ch-ticker__track-wrap">
        <div className="mn-ch-ticker__track">
          {doubled.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              href={marketNewsDetailHref(item.id)}
              className="mn-ch-ticker__item"
            >
              <span className="mn-ch-ticker__time">{formatNewsTimeAgo(item.minutesAgo)}</span>
              <span className="mn-ch-ticker__headline">{item.headline}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
