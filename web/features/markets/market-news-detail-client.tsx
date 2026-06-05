"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { IntelWorkspaceSkeleton } from "@/features/markets/components/markets-states";
import { useMarketNewsDetail } from "@/features/markets/hooks/use-market-news-detail";
import {
  formatNewsTimeAgo,
  getMarketNewsPhoto,
  marketNewsDetailHref,
  NEWS_CAT_CFG,
  newsIntelBullets,
} from "@/features/markets/lib/market-news-shared";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = { newsId: string };

function ImpactBadge({ tier }: { tier: 1 | 2 | 3 }) {
  return <span className={`mnd-badge-impact mnd-badge-impact--${tier}`}>ETKİ {tier}</span>;
}

function CatBadge({ cat }: { cat: string }) {
  const cfg = NEWS_CAT_CFG[cat as keyof typeof NEWS_CAT_CFG];
  if (!cfg) return null;
  return (
    <span className={`mnd-badge-cat mnd-badge-cat--${cat}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function IntelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mnd-section">
      <h2 className="mnd-section-title">{title}</h2>
      <div className="mnd-section-body">{children}</div>
    </section>
  );
}

function RelatedCard({ item }: { item: MarketNewsIntelligenceItem }) {
  const src = getMarketNewsPhoto(item);
  const cfg = NEWS_CAT_CFG[item.newsCategory as keyof typeof NEWS_CAT_CFG] ?? NEWS_CAT_CFG.macro;

  return (
    <Link href={marketNewsDetailHref(item.id)} className="mnd-related-card">
      <div className="mnd-related-img-wrap">
        <img src={src} alt="" className="mnd-related-img" loading="lazy" />
        <div className="mnd-related-stripe" style={{ background: cfg.stripe }} />
      </div>
      <div className="mnd-related-body">
        <ImpactBadge tier={item.impactTier} />
        <p className="mnd-related-headline">{item.headline}</p>
        <p className="mnd-related-meta">
          {item.source} · {formatNewsTimeAgo(item.minutesAgo)}
        </p>
      </div>
    </Link>
  );
}

export function MarketNewsDetailClient({ newsId }: Props) {
  const { item, related, isLoading, notFound } = useMarketNewsDetail(newsId);

  if (isLoading) {
    return <IntelWorkspaceSkeleton rows={6} />;
  }

  if (notFound || !item) {
    return (
      <div className="mnd-page ms-page-wrapper ms-container-markets min-w-0 py-16">
        <EmptyState
          title="Haber bulunamadı"
          description="Bağlantı süresi dolmuş veya haber kaldırılmış olabilir."
          actionLabel="Haber merkezine dön"
          actionHref="/market-news"
          tone="market"
          compact
        />
      </div>
    );
  }

  const ext = item as typeof item & { imageUrl?: string | null };
  const photo = getMarketNewsPhoto({ ...item, imageUrl: ext.imageUrl });
  const cfg = NEWS_CAT_CFG[item.newsCategory as keyof typeof NEWS_CAT_CFG] ?? NEWS_CAT_CFG.macro;
  const bullets = newsIntelBullets(item);

  return (
    <article className="mnd-page ms-page-wrapper ms-container-markets min-w-0">
      {/* Üst navigasyon — Bloomberg reader chrome */}
      <header className="mnd-topbar">
        <Link href="/market-news" className="mnd-back-link">
          ← Piyasa Haberleri
        </Link>
        <div className="mnd-topbar-actions">
          <Link href="/economic-calendar" className="mnd-topbar-btn">
            📅 Takvim
          </Link>
          <Link href="/watchlist" className="mnd-topbar-btn">
            ⭐ İzleme
          </Link>
        </div>
      </header>

      {/* Hero — sinematik kapak + meta */}
      <div className="mnd-hero">
        <div className="mnd-hero-media">
          <img src={photo} alt="" className="mnd-hero-img" />
          <div className="mnd-hero-overlay" />
          <div className="mnd-hero-stripe" style={{ background: cfg.stripe }} />
        </div>
        <div className="mnd-hero-content">
          <div className="mnd-hero-badges">
            <ImpactBadge tier={item.impactTier} />
            <CatBadge cat={item.newsCategory} />
            {item.hitsWatchlist ? <span className="mnd-watch-tag">İZLEME</span> : null}
            {item.hitsPortfolio ? <span className="mnd-portfolio-tag">PORTFÖY</span> : null}
          </div>
          <h1 className="mnd-headline">{item.headline}</h1>
          <div className="mnd-meta-row">
            <span className="mnd-meta-src">{item.source}</span>
            <span className="mnd-meta-dot">·</span>
            <time className="mnd-meta-time">{formatNewsTimeAgo(item.minutesAgo)}</time>
            <span className="mnd-meta-dot">·</span>
            <span className="mnd-meta-sector">Sektör: {item.sectorImpact}</span>
          </div>
        </div>
      </div>

      {/* Intel özeti — Bloomberg 3-bullet pattern */}
      {bullets.length > 0 ? (
        <aside className="mnd-intel-summary" aria-label="Haber özeti">
          <p className="mnd-intel-label">Piyasa özeti</p>
          <ul className="mnd-intel-list">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      <div className="mnd-layout">
        {/* Ana kolon — derin analiz */}
        <div className="mnd-main">
          <IntelSection title="Piyasa tepkisi">
            <p className="mnd-prose">{item.marketReaction}</p>
            <p className="mnd-prose mnd-prose--muted">
              Momentum: <strong>{item.momentumShift}</strong>
            </p>
          </IntelSection>

          <IntelSection title="Volatilite beklentisi">
            <p className="mnd-prose">{item.volatilityExpectation}</p>
            <p className="mnd-prose mnd-prose--muted">{item.signalActivityLabel}</p>
          </IntelSection>

          <IntelSection title="Zincir etkisi">
            <p className="mnd-prose">{item.chainReactionHint}</p>
            {item.relatedMacroThemes.length > 0 ? (
              <div className="mnd-theme-chips">
                {item.relatedMacroThemes.map((t) => (
                  <span key={t} className="mnd-theme-chip">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </IntelSection>

          <IntelSection title="Geçmiş seans yankısı">
            <p className="mnd-prose">{item.historicalEcho}</p>
          </IntelSection>

          {item.discussionSnippet ? (
            <IntelSection title="Topluluk akışı">
              <p className="mnd-prose">{item.discussionSnippet}</p>
              <Link href={`/results?q=${encodeURIComponent(item.symbol)}&tab=community`} className="mnd-inline-cta">
                İlgili tartışmaları ara →
              </Link>
            </IntelSection>
          ) : null}

          {item.creatorCommentary.length > 0 ? (
            <IntelSection title="Üretici yorumları">
              <ul className="mnd-commentary-list">
                {item.creatorCommentary.map((c) => (
                  <li key={c.display} className="mnd-commentary-item">
                    <Link href={c.href} className="mnd-commentary-author">
                      {c.display}
                    </Link>
                    <p className="mnd-commentary-note">{c.note}</p>
                  </li>
                ))}
              </ul>
            </IntelSection>
          ) : null}
        </div>

        {/* Yan kolon — Robinhood-style sembol rail */}
        <aside className="mnd-rail" aria-label="Piyasa bağlamı">
          <div className="mnd-rail-block">
            <h3 className="mnd-rail-title">Etkilenen semboller</h3>
            <div className="mnd-sym-grid">
              {item.affectedSymbols.map((s) => (
                <Link key={s} href={`/markets/${encodeURIComponent(s)}`} className="mnd-sym-pill">
                  {s}
                </Link>
              ))}
            </div>
            <Link
              href={`/signals?asset=${encodeURIComponent(item.symbol)}`}
              className={cn("mnd-rail-cta", "mnd-rail-cta--primary")}
            >
              {item.symbol} sinyalleri →
            </Link>
          </div>

          <div className="mnd-rail-block">
            <h3 className="mnd-rail-title">Hızlı bağlantılar</h3>
            <nav className="mnd-rail-nav">
              <Link href={`/markets/${encodeURIComponent(item.symbol)}`}>Varlık detayı</Link>
              <Link href="/portfolio">Portföy etkisi</Link>
              <Link href="/economic-calendar">Ekonomik takvim</Link>
            </nav>
          </div>

          {related.length > 0 ? (
            <div className="mnd-rail-block">
              <h3 className="mnd-rail-title">İlgili haberler</h3>
              <div className="mnd-related-stack">
                {related.map((r) => (
                  <RelatedCard key={r.id} item={r} />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
