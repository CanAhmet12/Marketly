import Link from "next/link";

import { MarketNewsWireRow } from "@/features/markets/components/market-news/market-news-wire-row";
import { NEWS_CAT_CFG } from "@/features/markets/lib/market-news-shared";
import { pickWireHeadlines } from "@/features/markets/lib/market-news-channel";
import { NEWS_CATEGORY_ORDER } from "@/features/markets/lib/news-card-tones";
import type { MarketNewsIntelligenceItem, MarketNewsroomBundle } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  items: readonly MarketNewsIntelligenceItem[];
  categoryCounts: MarketNewsroomBundle["categoryCounts"];
  excludeIds?: ReadonlySet<string>;
  activeCat?: string;
};

export function MarketNewsDeskRail({
  items,
  categoryCounts,
  excludeIds,
  activeCat = "all",
}: Props) {
  const wire = pickWireHeadlines(items, 9, excludeIds);

  return (
    <aside className="mn-ch-desk-rail" aria-label="Haber kanalı kenar çubuğu">
      <div className="mn-ch-desk-rail__block">
        <div className="mn-ch-desk-rail__head">
          <h2 className="mn-ch-desk-rail__title">Ajans hattı</h2>
          <span className="mn-ch-desk-rail__sub">Son başlıklar</span>
        </div>
        <div className="mn-ch-desk-rail__wire">
          {wire.map((item, i) => (
            <MarketNewsWireRow key={item.id} item={item} rank={i + 1} compact />
          ))}
        </div>
      </div>

      <div className="mn-ch-desk-rail__block">
        <h2 className="mn-ch-desk-rail__title">Bölümler</h2>
        <nav className="mn-ch-desk-rail__cats" aria-label="Haber kategorileri">
          <Link
            href="/market-news"
            className={cn("mn-ch-desk-rail__cat", activeCat === "all" && "is-active")}
          >
            Tümü
            <span className="mn-ch-desk-rail__count">{categoryCounts.all}</span>
          </Link>
          {NEWS_CATEGORY_ORDER.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            if (count === 0) return null;
            const cfg = NEWS_CAT_CFG[cat];
            return (
              <Link
                key={cat}
                href={`/market-news?cat=${cat}`}
                className={cn(
                  "mn-ch-desk-rail__cat",
                  `mn-ch-desk-rail__cat--${cat}`,
                  activeCat === cat && "is-active",
                )}
              >
                <span className={cn("mn-ch-desk-rail__cat-dot", `mn-ch-desk-rail__cat-dot--${cat}`)} aria-hidden />
                {cfg.tabLabel}
                <span className="mn-ch-desk-rail__count">{count}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mn-ch-desk-rail__block mn-ch-desk-rail__block--muted">
        <h2 className="mn-ch-desk-rail__title">Piyasa masası</h2>
        <nav className="mn-ch-desk-rail__nav">
          <Link href="/economic-calendar">Ekonomik takvim</Link>
          <Link href="/watchlist">İzleme listesi</Link>
          <Link href="/signals">Sinyal merkezi</Link>
          <Link href="/markets">Piyasalar</Link>
        </nav>
      </div>
    </aside>
  );
}
