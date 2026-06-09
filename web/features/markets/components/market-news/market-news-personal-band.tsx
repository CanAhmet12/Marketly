import Link from "next/link";

type Props = {
  headline: string;
  watchlistHits: number;
  portfolioHits: number;
};

export function MarketNewsPersonalBand({
  headline,
  watchlistHits,
  portfolioHits,
}: Props) {
  const hasHits = watchlistHits > 0 || portfolioHits > 0;

  return (
    <aside className="mn-personal-band" aria-label="Kişisel haber bağlamı">
      <div className="mn-personal-band__copy">
        <span className="mn-personal-band__label">Bağlam</span>
        <p className="mn-personal-band__headline">{headline}</p>
      </div>
      {hasHits ? (
        <div className="mn-personal-band__stats">
          {watchlistHits > 0 ? (
            <span className="mn-personal-band__stat">
              <strong>{watchlistHits}</strong> izleme kesişimi
            </span>
          ) : null}
          {portfolioHits > 0 ? (
            <span className="mn-personal-band__stat">
              <strong>{portfolioHits}</strong> portföy kesişimi
            </span>
          ) : null}
        </div>
      ) : (
        <Link href="/watchlist" className="mn-personal-band__cta">
          Sembol ekle →
        </Link>
      )}
    </aside>
  );
}
