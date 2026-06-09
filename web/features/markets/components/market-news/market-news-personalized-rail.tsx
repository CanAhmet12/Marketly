import { MarketNewsGridCard } from "@/features/markets/components/market-news/market-news-grid-card";
import { sortByEditorialPriority } from "@/features/markets/lib/market-news-editorial";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";

const RAIL_MAX = 5;

type Props = {
  items: readonly MarketNewsIntelligenceItem[];
  excludeIds?: ReadonlySet<string>;
};

export function MarketNewsPersonalizedRail({ items, excludeIds }: Props) {
  const personalized = sortByEditorialPriority(
    items.filter(
      (i) =>
        (i.hitsWatchlist || i.hitsPortfolio) &&
        !(excludeIds?.has(i.id) ?? false),
    ),
  ).slice(0, RAIL_MAX);

  if (personalized.length === 0) return null;

  return (
    <section className="mn-personalized-rail" aria-label="Senin için öne çıkan haberler">
      <div className="mn-personalized-rail__header">
        <h2 className="mn-personalized-rail__title">Senin için</h2>
        <p className="mn-personalized-rail__hint">İzleme listesi ve portföy kesişimleri</p>
      </div>
      <div className="mn-personalized-rail__scroll">
        {personalized.map((item, index) => (
          <div key={item.id} className="mn-personalized-rail__item">
            <MarketNewsGridCard item={item} index={index + 1} variant="rail" />
          </div>
        ))}
      </div>
    </section>
  );
}
