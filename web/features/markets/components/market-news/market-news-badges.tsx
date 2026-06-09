import { NEWS_CAT_CFG } from "@/features/markets/lib/market-news-shared";
import type { NewsCardTone } from "@/features/markets/lib/news-card-tones";
import { cn } from "@/lib/cn";

export function NewsImpactBadge({ tier }: { tier: 1 | 2 | 3 }) {
  return (
    <span className={cn("mn-p-badge-impact", `mn-p-badge-impact--${tier}`)}>
      Etki {tier}
    </span>
  );
}

export function NewsCategoryBadge({ cat }: { cat: NewsCardTone }) {
  const cfg = NEWS_CAT_CFG[cat];
  return (
    <span className={cn("mn-p-badge-cat", `mn-p-badge-cat--${cat}`)}>
      {cfg.shortLabel}
    </span>
  );
}

export function NewsWatchlistBadge({ variant = "compact" }: { variant?: "compact" | "hero" }) {
  return (
    <span className={cn("mn-p-badge-watch", variant === "hero" && "mn-p-badge-watch--hero")}>
      İzleme
    </span>
  );
}

export function NewsPortfolioBadge() {
  return <span className="mn-p-badge-portfolio">Portföy</span>;
}
