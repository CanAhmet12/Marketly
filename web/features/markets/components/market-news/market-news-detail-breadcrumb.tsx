import Link from "next/link";

import { NEWS_CAT_CFG } from "@/features/markets/lib/market-news-shared";
import type { NewsCardTone } from "@/features/markets/lib/news-card-tones";
import { cn } from "@/lib/cn";

type Props = {
  category: NewsCardTone;
  headline: string;
};

export function MarketNewsDetailBreadcrumb({ category, headline }: Props) {
  const cfg = NEWS_CAT_CFG[category];

  return (
    <nav className="mnd-breadcrumb" aria-label="Haber konumu">
      <Link href="/market-news" className="mnd-breadcrumb__link">
        Piyasa Haberleri
      </Link>
      <span className="mnd-breadcrumb__sep" aria-hidden>
        /
      </span>
      <Link href={`/market-news?cat=${category}`} className="mnd-breadcrumb__link">
        {cfg.label}
      </Link>
      <span className="mnd-breadcrumb__sep" aria-hidden>
        /
      </span>
      <span className={cn("mnd-breadcrumb__current", "line-clamp-1")}>{headline}</span>
    </nav>
  );
}
