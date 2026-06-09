import { MarketNewsDetailRelatedCard } from "@/features/markets/components/market-news/market-news-detail-related-card";
import type { MarketNewsDetailItem } from "@/features/markets/types/news-calendar-intelligence";

type Props = {
  items: readonly MarketNewsDetailItem[];
};

export function MarketNewsDetailReadNext({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="mnd-ch-read-next" aria-label="Sıradaki haberler">
      <div className="mnd-ch-read-next__head">
        <h2 className="mnd-ch-read-next__title">Sıradaki haberler</h2>
        <p className="mnd-ch-read-next__dek">Editör seçimi — ilgili başlıklar</p>
      </div>
      <div className="mnd-ch-read-next__grid">
        {items.map((item) => (
          <MarketNewsDetailRelatedCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
