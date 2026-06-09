import Link from "next/link";

import { MarketNewsLivePill } from "@/features/markets/components/market-news/market-news-live-pill";
import { formatNewsEditionDate } from "@/features/markets/lib/market-news-channel";

type Props = {
  showLive?: boolean;
  isRefetching?: boolean;
};

export function MarketNewsHeader({ showLive = false, isRefetching = false }: Props) {
  return (
    <header className="mn-premium-header mn-ch-masthead">
      <div className="mn-ch-masthead__edition">
        <span className="mn-ch-masthead__edition-label">Baskı</span>
        <time className="mn-ch-masthead__edition-date" dateTime={new Date().toISOString()}>
          {formatNewsEditionDate()}
        </time>
      </div>
      <div className="mn-premium-header__main">
        <div className="mn-premium-header__brand">
          <span className="mn-premium-header__eyebrow">Marketly Intel</span>
          <div className="mn-premium-header__divider" aria-hidden />
          <div className="mn-ch-masthead__title-wrap">
            <h1 className="mn-premium-header__title">Piyasa Haberleri</h1>
            <p className="mn-ch-masthead__tagline">Canlı piyasa haber kanalı</p>
          </div>
        </div>
        {showLive ? (
          <MarketNewsLivePill isRefetching={isRefetching} className="mn-premium-header__live" />
        ) : (
          <div className="mn-premium-header__live mn-premium-header__live--static" role="status">
            <span className="mn-premium-header__live-dot" aria-hidden />
            <span>Haber merkezi</span>
          </div>
        )}
      </div>
      <nav className="mn-premium-header__actions" aria-label="İlgili sayfalar">
        <Link href="/economic-calendar" className="mn-premium-header__btn">
          Ekonomik takvim
        </Link>
        <Link href="/watchlist" className="mn-premium-header__btn">
          İzleme listesi
        </Link>
      </nav>
    </header>
  );
}
