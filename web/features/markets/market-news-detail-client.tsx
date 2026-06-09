"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { EmptyState } from "@/components/states";
import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import { MarketNewsDetailSkeleton } from "@/features/markets/components/markets-states";
import {
  NewsCategoryBadge,
  NewsImpactBadge,
  NewsPortfolioBadge,
  NewsWatchlistBadge,
} from "@/features/markets/components/market-news/market-news-badges";
import { MarketNewsBreakingBadge } from "@/features/markets/components/market-news/market-news-breaking-badge";
import { MarketNewsDetailBreadcrumb } from "@/features/markets/components/market-news/market-news-detail-breadcrumb";
import { MarketNewsDetailByline } from "@/features/markets/components/market-news/market-news-detail-byline";
import { MarketNewsDetailContextBar } from "@/features/markets/components/market-news/market-news-detail-context-bar";
import { MarketNewsDetailReadNext } from "@/features/markets/components/market-news/market-news-detail-read-next";
import { MarketNewsDetailRelatedCard } from "@/features/markets/components/market-news/market-news-detail-related-card";
import { MarketNewsLivePill } from "@/features/markets/components/market-news/market-news-live-pill";
import {
  estimateReadMinutes,
  pickStandfirst,
} from "@/features/markets/lib/market-news-channel";
import { useMarketNewsDetail } from "@/features/markets/hooks/use-market-news-detail";
import {
  articleBodyText,
  hasChainIntel,
  hasDiscussionIntel,
  hasHistoricalIntel,
  hasMarketReactionIntel,
  hasRichIntelSections,
  hasVolatilityIntel,
  isIntelPlaceholder,
  newsIntelBulletsFiltered,
} from "@/features/markets/lib/market-news-detail-intel";
import {
  formatNewsPublishedAt,
  formatNewsTimeAgo,
  formatSentimentLabel,
  getMarketNewsPhoto,
  NEWS_CAT_CFG,
  shareMarketNews,
} from "@/features/markets/lib/market-news-shared";
import { getNewsCardTone } from "@/features/markets/lib/news-card-tones";
import { cn } from "@/lib/cn";

type Props = { newsId: string };

function IntelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mnd-section">
      <h2 className="mnd-section-title">{title}</h2>
      <div className="mnd-section-body">{children}</div>
    </section>
  );
}

function DetailHeroMedia({
  photo,
  tone,
}: {
  photo: string;
  tone: ReturnType<typeof getNewsCardTone>;
}) {
  const remote = photo.startsWith("http://") || photo.startsWith("https://");

  return (
    <div className={cn("mnd-hero-media", `mnd-hero-media--tone-${tone}`)}>
      {remote ? (
        <RemoteCoverImage
          src={photo}
          alt=""
          className="mnd-hero-img"
          sizes="(max-width: 960px) 100vw, 960px"
          priority
        />
      ) : (
        <img src={photo} alt="" className="mnd-hero-img" />
      )}
      <div className="mnd-hero-media__well" aria-hidden />
      <div className="mnd-hero-overlay mnd-hero-overlay--article" aria-hidden />
      <div className="mnd-hero-tone-wash mnd-hero-tone-wash--article pointer-events-none absolute inset-0 z-[2]" aria-hidden />
    </div>
  );
}

export function MarketNewsDetailClient({ newsId }: Props) {
  const { item, related, isLoading, notFound, liveMode, isRefetching } = useMarketNewsDetail(newsId);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const onShare = useCallback(async () => {
    if (!item) return;
    const result = await shareMarketNews(item);
    if (result === "shared") setShareNote("Paylaşıldı");
    else if (result === "copied") setShareNote("Bağlantı kopyalandı");
    else setShareNote("Paylaşım desteklenmiyor");
    window.setTimeout(() => setShareNote(null), 2200);
  }, [item]);

  if (isLoading) {
    return <MarketNewsDetailSkeleton />;
  }

  if (notFound || !item) {
    return (
      <article className="mnd-page mnd-page--premium ms-page-wrapper ms-container-markets min-w-0">
        <header className="mnd-topbar">
          <Link href="/market-news" className="mnd-back-link">
            ← Piyasa Haberleri
          </Link>
        </header>
        <div className="py-16">
          <EmptyState
            title="Haber bulunamadı"
            description="Bağlantı süresi dolmuş veya haber kaldırılmış olabilir."
            actionLabel="Haber merkezine dön"
            actionHref="/market-news"
            tone="market"
            compact
          />
        </div>
      </article>
    );
  }

  const photo = getMarketNewsPhoto({ ...item, imageUrl: item.imageUrl });
  const tone = getNewsCardTone(item.newsCategory);
  const cfg = NEWS_CAT_CFG[item.newsCategory];
  const body = articleBodyText(item);
  const bullets = newsIntelBulletsFiltered(item, body);
  const sourceUrl = item.sourceUrl?.trim();
  const showRichIntel = hasRichIntelSections(item);
  const publishedLabel = formatNewsPublishedAt(item.publishedAt);
  const sentimentLabel = formatSentimentLabel(item.sentimentLabel) ?? null;
  const standfirst = pickStandfirst(item, body);
  const readMinutes = estimateReadMinutes(body ?? standfirst);
  const sectorLabel = !isIntelPlaceholder(item.sectorImpact) ? item.sectorImpact : null;

  return (
    <article
      className={cn(
        "mnd-page mnd-page--premium mnd-page--channel ms-page-wrapper ms-container-markets min-w-0",
        `mnd-page--tone-${tone}`,
      )}
    >
      <div className="mnd-ch-channel-strip" aria-hidden>
        <span>Marketly Intel</span>
        <span className="mnd-ch-channel-strip__sep">|</span>
        <span>Piyasa Haberleri</span>
      </div>
      <header className="mnd-topbar">
        <Link href="/market-news" className="mnd-back-link">
          ← Piyasa Haberleri
        </Link>
        <nav className="mnd-topbar-actions" aria-label="Haber eylemleri">
          {liveMode ? <MarketNewsLivePill isRefetching={isRefetching} className="mnd-topbar-live" /> : null}
          <button type="button" className="mnd-topbar-btn" onClick={() => void onShare()}>
            Paylaş
          </button>
          <Link href="/economic-calendar" className="mnd-topbar-btn">
            Ekonomik takvim
          </Link>
          <Link href="/watchlist" className="mnd-topbar-btn">
            İzleme listesi
          </Link>
        </nav>
        {shareNote ? (
          <p className="mnd-share-note" role="status" aria-live="polite">
            {shareNote}
          </p>
        ) : null}
      </header>

      <MarketNewsDetailBreadcrumb category={tone} headline={item.headline} />

      <header className={cn("mnd-ch-article-header", `mnd-ch-article-header--${tone}`)}>
        <div className="mnd-hero-badges">
          {item.impactTier >= 3 ? <MarketNewsBreakingBadge /> : null}
          <NewsImpactBadge tier={item.impactTier} />
          <NewsCategoryBadge cat={tone} />
          {item.hitsWatchlist ? <NewsWatchlistBadge variant="hero" /> : null}
          {item.hitsPortfolio ? <NewsPortfolioBadge /> : null}
        </div>
        <h1 className="mnd-headline mnd-ch-headline">{item.headline}</h1>
        {standfirst ? <p className="mnd-ch-standfirst">{standfirst}</p> : null}
        <MarketNewsDetailByline
          source={item.source}
          minutesAgo={item.minutesAgo}
          publishedAt={item.publishedAt}
          readMinutes={readMinutes}
          sectorImpact={sectorLabel}
        />
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mnd-source-cta mnd-ch-source-cta"
          >
            Orijinal kaynağı aç
            <span className="mnd-source-cta__icon" aria-hidden>
              ↗
            </span>
          </a>
        ) : null}
      </header>

      <figure className={cn("mnd-ch-figure", `mnd-ch-figure--${tone}`)}>
        <DetailHeroMedia photo={photo} tone={tone} />
        <figcaption className="mnd-ch-caption">
          {item.source}
          {publishedLabel ? ` · ${publishedLabel}` : ` · ${formatNewsTimeAgo(item.minutesAgo)}`}
        </figcaption>
      </figure>

      <MarketNewsDetailContextBar
        category={tone}
        symbols={item.affectedSymbols}
        sentimentLabel={sentimentLabel}
      />

      {bullets.length > 0 && (showRichIntel || bullets.length > 1 || !body) ? (
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
        <div className="mnd-main">
          {body ? (
            <IntelSection title="Haber metni">
              <p className="mnd-prose mnd-prose--lead">{body}</p>
            </IntelSection>
          ) : null}

          {hasMarketReactionIntel(item) ? (
            <IntelSection title="Piyasa tepkisi">
              {!isIntelPlaceholder(item.marketReaction) ? (
                <p className="mnd-prose">{item.marketReaction}</p>
              ) : null}
              {!isIntelPlaceholder(item.momentumShift) ? (
                <p className="mnd-prose mnd-prose--muted">
                  Momentum: <strong>{item.momentumShift}</strong>
                </p>
              ) : null}
            </IntelSection>
          ) : null}

          {hasVolatilityIntel(item) ? (
            <IntelSection title="Volatilite beklentisi">
              {!isIntelPlaceholder(item.volatilityExpectation) ? (
                <p className="mnd-prose">{item.volatilityExpectation}</p>
              ) : null}
              {!isIntelPlaceholder(item.signalActivityLabel) ? (
                <p className="mnd-prose mnd-prose--muted">{item.signalActivityLabel}</p>
              ) : null}
            </IntelSection>
          ) : null}

          {hasChainIntel(item) ? (
            <IntelSection title="Zincir etkisi">
              {!isIntelPlaceholder(item.chainReactionHint) ? (
                <p className="mnd-prose">{item.chainReactionHint}</p>
              ) : null}
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
          ) : null}

          {hasHistoricalIntel(item) ? (
            <IntelSection title="Geçmiş seans yankısı">
              <p className="mnd-prose">{item.historicalEcho}</p>
            </IntelSection>
          ) : null}

          {hasDiscussionIntel(item) && body !== item.discussionSnippet.trim() ? (
            <IntelSection title="Topluluk akışı">
              <p className="mnd-prose">{item.discussionSnippet}</p>
              <Link
                href={`/results?q=${encodeURIComponent(item.symbol)}&tab=community`}
                className="mnd-inline-cta"
              >
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

          {!showRichIntel && !body ? (
            <div className="mnd-fallback-note">
              <p className="mnd-prose mnd-prose--muted">
                Bu haber için derinlemesine intel henüz işlenmedi.
                {sourceUrl ? " Orijinal kaynaktan detayları okuyabilirsiniz." : null}
              </p>
            </div>
          ) : null}

          <MarketNewsDetailReadNext items={related} />
        </div>

        <aside className="mnd-rail" aria-label="Piyasa bağlamı">
          <div className={cn("mnd-rail-block", "mnd-rail-block--tone", `mnd-rail-block--${tone}`)}>
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
              <Link href={`/market-news?cat=${item.newsCategory}`}>
                {cfg.label} haberleri
              </Link>
            </nav>
          </div>

          {related.length > 0 ? (
            <div className="mnd-rail-block">
              <h3 className="mnd-rail-title">İlgili haberler</h3>
              <div className="mnd-related-stack">
                {related.map((r) => (
                  <MarketNewsDetailRelatedCard key={r.id} item={r} />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
