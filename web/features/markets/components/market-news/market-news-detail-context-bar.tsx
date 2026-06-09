import Link from "next/link";

import { NEWS_CAT_CFG } from "@/features/markets/lib/market-news-shared";
import type { NewsCardTone } from "@/features/markets/lib/news-card-tones";
import { cn } from "@/lib/cn";

type Props = {
  category: NewsCardTone;
  symbols: readonly string[];
  sentimentLabel?: string | null;
};

export function MarketNewsDetailContextBar({
  category,
  symbols,
  sentimentLabel,
}: Props) {
  const cfg = NEWS_CAT_CFG[category];
  const sentiment = sentimentLabel?.trim();

  return (
    <div className={cn("mnd-context-bar", `mnd-context-bar--${category}`)}>
      <div className="mnd-context-bar__left">
        <Link href={`/market-news?cat=${category}`} className="mnd-context-bar__cat">
          <span className={cn("mnd-context-bar__dot", `mnd-context-bar__dot--${category}`)} aria-hidden />
          {cfg.label}
        </Link>
        {sentiment ? (
          <span
            className={cn(
              "mnd-context-bar__sentiment",
              sentiment.toLowerCase().includes("pozitif") && "mnd-context-bar__sentiment--positive",
              sentiment.toLowerCase().includes("negatif") && "mnd-context-bar__sentiment--negative",
            )}
          >
            {sentiment}
          </span>
        ) : null}
      </div>
      {symbols.length > 0 ? (
        <div className="mnd-context-bar__symbols">
          {symbols.slice(0, 5).map((s) => (
            <Link key={s} href={`/markets/${encodeURIComponent(s)}`} className="mnd-context-bar__sym">
              {s}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
