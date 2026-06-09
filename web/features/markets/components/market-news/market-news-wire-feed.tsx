import { MarketNewsWireRow } from "@/features/markets/components/market-news/market-news-wire-row";
import { pickWireHeadlines } from "@/features/markets/lib/market-news-channel";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";

type Props = {
  items: readonly MarketNewsIntelligenceItem[];
  excludeIds?: ReadonlySet<string>;
  limit?: number;
};

export function MarketNewsWireFeed({ items, excludeIds, limit = 6 }: Props) {
  const wire = pickWireHeadlines(items, limit, excludeIds);
  if (wire.length < 3) return null;

  return (
    <section className="mn-ch-wire-feed" aria-label="Ajans akışı">
      <div className="mn-ch-wire-feed__head">
        <h2 className="mn-ch-wire-feed__title">Ajans akışı</h2>
        <p className="mn-ch-wire-feed__dek">Kısa başlık hattı — hızlı tarama</p>
      </div>
      <div className="mn-ch-wire-feed__list">
        {wire.map((item) => (
          <MarketNewsWireRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
