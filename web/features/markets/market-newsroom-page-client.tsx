"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/states";
import { IntelWorkspaceSkeleton } from "@/features/markets/components/markets-states";
import {
  formatNewsTimeAgo,
  getMarketNewsPhoto,
  marketNewsDetailHref,
} from "@/features/markets/lib/market-news-shared";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { useMarketNewsroom } from "@/features/markets/hooks/use-market-newsroom";
import type { MarketNewsIntelligenceItem, MarketNewsroomBundle } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type NewsCat = keyof MarketNewsroomBundle["categoryCounts"];

const NEWS_CATS = ["crypto", "macro", "earnings", "flows", "local"] as const;

const CAT_CFG = {
  crypto:   { label: "Kripto",       tabLabel: "Kripto",       emoji: "₿",  stripe: "#f59e0b", tabCls: "mn-tab--crypto"   },
  macro:    { label: "Ekonomi",      tabLabel: "Ekonomi",      emoji: "📊", stripe: "#3b82f6", tabCls: "mn-tab--macro"    },
  earnings: { label: "Şirketler",    tabLabel: "Şirketler",    emoji: "🏢", stripe: "#22c55e", tabCls: "mn-tab--earnings" },
  flows:    { label: "Emtia & Akış", tabLabel: "Emtia & Akış", emoji: "⚡", stripe: "#8b5cf6", tabCls: "mn-tab--flows"    },
  local:    { label: "Türkiye",      tabLabel: "Türkiye",      emoji: "🇹🇷", stripe: "#14b8a6", tabCls: "mn-tab--local"    },
} as const;

function resolveNewsCat(raw: string | null): NewsCat {
  if (!raw || raw === "all") return "all";
  if ((NEWS_CATS as readonly string[]).includes(raw)) return raw as NewsCat;
  return "all";
}

function fmtTime(mins: number): string {
  return formatNewsTimeAgo(mins).replace(" önce", "");
}

function getPhoto(item: MarketNewsIntelligenceItem): string {
  const ext = item as MarketNewsIntelligenceItem & { imageUrl?: string | null };
  return getMarketNewsPhoto({ ...item, imageUrl: ext.imageUrl });
}

/* ================================
   BADGE'LER
   ================================ */

function ImpactBadge({ tier }: { tier: 1 | 2 | 3 }) {
  return <span className={`mn-badge-impact mn-badge-impact--${tier}`}>ETKİ {tier}</span>;
}

function CatBadge({ cat }: { cat: string }) {
  const cfg = CAT_CFG[cat as keyof typeof CAT_CFG];
  if (!cfg) return null;
  return <span className={`mn-badge-cat mn-badge-cat--${cat}`}>{cfg.emoji} {cfg.label}</span>;
}

/* ================================
   GRID NEWS CARD
   Fotoğraf tam kart, gradient, başlık üstte
   ================================ */

function NewsCard({ item }: { item: MarketNewsIntelligenceItem }) {
  const src = getPhoto(item);

  return (
    <Link href={marketNewsDetailHref(item.id)} className={cn("mn-card", `mn-card--${item.newsCategory}`, "mn-card--link")}>
      {/* Fotoğraf */}
      <img
        src={src}
        alt={item.headline}
        className="mn-card-img"
        loading="lazy"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent) parent.style.background = "#0d0f17";
        }}
      />

      {/* Sinematik gradient */}
      <div className="mn-card-overlay" />

      {/* Üst: badges */}
      <div className="mn-card-top">
        <ImpactBadge tier={item.impactTier} />
        <CatBadge cat={item.newsCategory} />
        {item.hitsWatchlist && <span className="mn-watchlist-tag">İZLEME</span>}
      </div>

      {/* Alt: başlık + meta */}
      <div className="mn-card-bottom">
        {item.affectedSymbols.length > 0 && (
          <div className="mn-card-symbols">
            {item.affectedSymbols.slice(0, 3).map((s) => (
              <span key={s} className="mn-sym-tag">{s}</span>
            ))}
          </div>
        )}
        <h3 className="mn-card-headline">{item.headline}</h3>
        <div className="mn-card-meta">
          <span className="mn-card-meta-src">{item.source}</span>
          <span>·</span>
          <span>{fmtTime(item.minutesAgo)} önce</span>
        </div>
      </div>
    </Link>
  );
}

/* ================================
   HERO ANA KART — büyük, sinematik
   ================================ */

function HeroMainCard({ item }: { item: MarketNewsIntelligenceItem }) {
  const src = getPhoto(item);
  const cfg = CAT_CFG[item.newsCategory as keyof typeof CAT_CFG] ?? CAT_CFG.macro;

  return (
    <Link href={marketNewsDetailHref(item.id)} className="mn-hero-main mn-card--link">
      {/* Fotoğraf */}
      <img
        src={src}
        alt={item.headline}
        className="mn-card-img"
        loading="eager"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent) parent.style.background = "#0d0f17";
        }}
      />

      {/* Kategori sol şerit */}
      <div className="mn-card-stripe" style={{ background: cfg.stripe }} />

      {/* Sinematik gradient */}
      <div className="mn-card-overlay" />

      {/* Üst: badges */}
      <div className="mn-card-top">
        <ImpactBadge tier={item.impactTier} />
        <CatBadge cat={item.newsCategory} />
        {item.hitsWatchlist && <span className="mn-watchlist-tag">İZLEMEDE</span>}
      </div>

      {/* Alt: içerik */}
      <div className="mn-card-bottom">
        {item.affectedSymbols.length > 0 && (
          <div className="mn-card-symbols">
            {item.affectedSymbols.slice(0, 4).map((s) => (
              <span key={s} className="mn-sym-tag">{s}</span>
            ))}
          </div>
        )}
        <h2 className="mn-card-headline">{item.headline}</h2>
        {item.discussionSnippet && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.45, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.discussionSnippet}
          </p>
        )}
        <div className="mn-card-meta">
          <span className="mn-card-meta-src">{item.source}</span>
          <span>·</span>
          <span>{fmtTime(item.minutesAgo)} önce</span>
        </div>
      </div>
    </Link>
  );
}

/* ================================
   HERO YAN KARTLAR — orantılı, 3 kart
   ================================ */

function HeroSideCard({ item }: { item: MarketNewsIntelligenceItem }) {
  const src = getPhoto(item);

  return (
    <Link href={marketNewsDetailHref(item.id)} className="mn-hero-side-card mn-card--link">
      <img
        src={src}
        alt={item.headline}
        className="mn-card-img"
        loading="lazy"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent) parent.style.background = "#0d0f17";
        }}
      />
      <div className="mn-card-overlay" />
      <div className="mn-card-top">
        <ImpactBadge tier={item.impactTier} />
        <CatBadge cat={item.newsCategory} />
      </div>
      <div className="mn-card-bottom">
        <h3 className="mn-card-headline">{item.headline}</h3>
        <div className="mn-card-meta">
          <span className="mn-card-meta-src">{item.source}</span>
          <span>·</span>
          <span>{fmtTime(item.minutesAgo)}</span>
        </div>
      </div>
    </Link>
  );
}

function NewsSection({ sectionKey, items, cols = 3 }: {
  sectionKey: string;
  items: MarketNewsIntelligenceItem[];
  cols?: 3 | 4;
}) {
  if (items.length === 0) return null;
  const cfg = CAT_CFG[sectionKey as keyof typeof CAT_CFG];
  if (!cfg) return null;

  return (
    <section className="mn-section">
      <div className="mn-section-header">
        <div className="mn-section-title">
          <span className="mn-section-stripe" style={{ background: cfg.stripe }} />
          {cfg.emoji} {cfg.label} Haberleri
        </div>
        <Link href="/market-news" className="mn-see-all">Tümünü Gör →</Link>
      </div>
      <div className={`mn-grid mn-grid--${cols}`}>
        {items.map((item) => <NewsCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}

/* ================================
   ANA CLIENT
   ================================ */

export function MarketNewsroomPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bundle, isLoading, isEmpty } = useMarketNewsroom();
  const tabRefs = useRef<Partial<Record<NewsCat, HTMLButtonElement | null>>>({});

  const activeCat = useMemo(() => resolveNewsCat(searchParams.get("cat")), [searchParams]);

  const pushCat = useCallback(
    (cat: NewsCat) => {
      if (cat === "all") {
        router.replace("/market-news", { scroll: false });
      } else {
        router.replace(`/market-news?cat=${cat}`, { scroll: false });
      }
    },
    [router],
  );

  useEffect(() => {
    if (!bundle || activeCat === "all") return;
    if ((bundle.categoryCounts[activeCat] ?? 0) === 0) {
      pushCat("all");
    }
  }, [bundle, activeCat, pushCat]);

  if (isLoading || !bundle) {
    return <IntelWorkspaceSkeleton rows={5} />;
  }

  if (isEmpty) {
    return (
      <div className="mn-page ms-page-wrapper ms-container-markets min-w-0 py-16">
        <EmptyState
          title="Haber akışı boş"
          description="market_news tablosunda henüz kayıt yok. fetch-market-news Edge Function çalıştırıldığında haberler burada görünecek."
          actionLabel="Piyasalar"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
          compact
        />
      </div>
    );
  }

  const allItems  = [...bundle.items];
  const sorted    = [...allItems].sort((a, b) => b.impactTier - a.impactTier);
  const heroMain  = sorted[0]!;
  const heroSide  = sorted.slice(1, 3);   /* 2 yan kart — daha büyük */

  const byCat = (cat: string) => allItems.filter((i) => i.newsCategory === cat);

  const CATS: (keyof typeof CAT_CFG)[] = ["crypto", "macro", "earnings", "flows", "local"];
  const visibleCats = CATS.filter((cat) => (bundle.categoryCounts[cat] ?? 0) > 0);
  const tabOrder: NewsCat[] = ["all", ...visibleCats];

  const filteredItems = activeCat === "all"
    ? allItems
    : allItems.filter((i) => i.newsCategory === activeCat);

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, current: NewsCat) => {
    const idx = tabOrder.indexOf(current);
    if (idx < 0) return;
    let nextIdx = idx;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabOrder.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + tabOrder.length) % tabOrder.length;
    else return;
    e.preventDefault();
    const next = tabOrder[nextIdx]!;
    tabRefs.current[next]?.focus();
    pushCat(next);
  };

  return (
    <div className="mn-page ms-page-wrapper ms-container-markets min-w-0">

      {/* ===== HEADER ===== */}
      <div className="mn-header">
        <div className="mn-header-left">
          <div>
            <div className="mn-header-brand">
              <span className="mn-header-site">Marketly</span>
              <div className="mn-header-divider" />
              <h1 className="mn-header-title">Piyasa Haberleri</h1>
            </div>
          </div>
          <span className="mn-live-badge">
            <span className="mn-live-dot" />
            Canlı
          </span>
        </div>
        <div className="mn-header-actions">
          <Link href="/economic-calendar" className="mn-header-btn">📅 Takvim</Link>
          <Link href="/watchlist" className="mn-header-btn">⭐ İzleme</Link>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="mn-tabs" role="tablist" aria-label="Haber kategorileri">
        <button
          id="mn-tab-all"
          type="button"
          role="tab"
          aria-selected={activeCat === "all"}
          aria-controls="market-news-panel"
          tabIndex={activeCat === "all" ? 0 : -1}
          ref={(el) => { tabRefs.current.all = el; }}
          className={cn("mn-tab mn-tab--all", activeCat === "all" && "active")}
          onClick={() => pushCat("all")}
          onKeyDown={(e) => onTabKeyDown(e, "all")}
        >
          Tüm Haberler <span className="mn-tab-count">{bundle.categoryCounts.all}</span>
        </button>
        {visibleCats.map((cat) => {
          const cfg = CAT_CFG[cat];
          const count = bundle.categoryCounts[cat] ?? 0;
          return (
            <button
              key={cat}
              id={`mn-tab-${cat}`}
              type="button"
              role="tab"
              aria-selected={activeCat === cat}
              aria-controls="market-news-panel"
              tabIndex={activeCat === cat ? 0 : -1}
              ref={(el) => { tabRefs.current[cat] = el; }}
              className={cn("mn-tab", cfg.tabCls, activeCat === cat && "active")}
              onClick={() => pushCat(cat)}
              onKeyDown={(e) => onTabKeyDown(e, cat)}
            >
              {cfg.emoji} {cfg.tabLabel}
              <span className="mn-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ===== İÇERİK ===== */}
      <div id="market-news-panel" role="tabpanel" aria-labelledby={`mn-tab-${activeCat}`}>
      {activeCat === "all" ? (
        <>
          {/* Hero */}
          <div className="mn-hero">
            <HeroMainCard item={heroMain} />
            <div className="mn-hero-side">
              {heroSide.map((item) => <HeroSideCard key={item.id} item={item} />)}
            </div>
          </div>

          {/* Kategori section'ları */}
          {CATS.map((cat) => {
            const items = byCat(cat);
            return (
              <NewsSection
                key={cat}
                sectionKey={cat}
                items={items}
                cols={3}
              />
            );
          })}
        </>
      ) : (
        (() => {
          if (filteredItems.length === 0) {
            return (
              <EmptyState
                title="Bu kategoride haber yok"
                description="Seçili kategoride şu an haber bulunmuyor."
                actionLabel="Tüm haberler"
                onAction={() => pushCat("all")}
                tone="market"
                compact
              />
            );
          }
          const heroF = filteredItems[0]!;
          const sideF = filteredItems.slice(1, 4);
          return (
            <>
              <div className="mn-hero">
                <HeroMainCard item={heroF} />
                <div className="mn-hero-side">
                  {sideF.map((item) => <HeroSideCard key={item.id} item={item} />)}
                </div>
              </div>
              {filteredItems.length > 4 && (
                <NewsSection sectionKey={activeCat} items={filteredItems.slice(4)} cols={3} />
              )}
            </>
          );
        })()
      )}
      </div>

    </div>
  );
}
