"use client";

import type { ReactNode } from "react";

import { SkeletonTimeline } from "@/components/states";

export function MarketsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-[var(--sp-3)] p-0 min-[520px]:grid-cols-2 min-[1024px]:grid-cols-3 min-[1400px]:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex flex-col gap-[var(--sp-3)] py-[var(--sp-3)]">
          <div className="motion-shimmer h-4 w-24 rounded-full bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-3 w-40 rounded-full bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-8 w-32 rounded-full bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-12 rounded-2xl bg-[var(--color-divider)]" />
        </li>
      ))}
    </ul>
  );
}

export function MarketsEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-[var(--sp-3)] py-[var(--sp-10)] text-center">
      <p className="text-[16px] font-bold text-[var(--color-text)]">{title}</p>
      <p className="mt-[var(--sp-3)] max-w-md text-[14px] font-medium leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
      {action ? <div className="mt-[var(--sp-5)]">{action}</div> : null}
    </div>
  );
}

export function MarketsOfflineBanner() {
  return (
    <div
      role="status"
      className="markets-glass-25 mb-[var(--sp-3)] flex items-center gap-[var(--sp-2)] rounded-2xl px-[var(--sp-3)] py-[var(--sp-2)] text-[13px] font-semibold text-[var(--color-text)]"
    >
      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[var(--color-danger)]" aria-hidden />
      Çevrimdışı görünüyorsunuz — veriler son kayıtlı durumu gösterebilir.
    </div>
  );
}

/** `/watchlist` hydration skeleton */
export function WatchlistPageSkeleton() {
  return (
    <div className="wl-page ms-page-wrapper ms-container-markets min-w-0" aria-busy="true">
      <div className="wl-header">
        <div className="wl-header-left">
          <div className="motion-shimmer h-3 w-28 rounded bg-[var(--color-divider)]" />
          <div className="motion-shimmer mt-2 h-7 w-40 rounded bg-[var(--color-divider)]" />
        </div>
      </div>
      <div className="wl-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="motion-shimmer h-16 rounded-xl bg-[var(--color-divider)]" />
        ))}
      </div>
      <div className="motion-shimmer mt-4 h-64 rounded-xl bg-[var(--color-divider)]" />
    </div>
  );
}

/** `/markets/[symbol]` SSR Suspense fallback */
export function AssetDetailSkeleton() {
  return (
    <div className="ad-canvas ms-page-wrapper min-w-0 px-[var(--sp-3)] py-[var(--sp-4)]" aria-busy="true">
      <div className="ms-container-markets space-y-4">
        <div className="motion-shimmer h-4 w-32 rounded bg-[var(--color-divider)]" />
        <div className="motion-shimmer h-24 rounded-2xl bg-[var(--color-divider)]" />
        <div className="grid gap-4 min-[900px]:grid-cols-[1fr_280px]">
          <div className="motion-shimmer h-72 rounded-2xl bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-72 rounded-2xl bg-[var(--color-divider)]" />
        </div>
      </div>
    </div>
  );
}

/** `/portfolio` hydration / SSR fallback */
export function PortfolioPageSkeleton() {
  return (
    <div className="pf-canvas ms-page-wrapper ms-container-markets min-w-0" aria-busy="true">
      <div className="pf-header">
        <div className="motion-shimmer h-3 w-28 rounded bg-[var(--color-divider)]" />
        <div className="motion-shimmer mt-2 h-8 w-44 rounded bg-[var(--color-divider)]" />
      </div>
      <div className="pf-hero mt-4 grid gap-3 min-[640px]:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="motion-shimmer h-20 rounded-xl bg-[var(--color-divider)]" />
        ))}
      </div>
      <div className="motion-shimmer mt-4 h-40 rounded-2xl bg-[var(--color-divider)]" />
      <div className="motion-shimmer mt-4 h-64 rounded-2xl bg-[var(--color-divider)]" />
    </div>
  );
}

/** `/price-alerts` hydration skeleton — finance zone DNA */
export function PriceAlertsPageSkeleton() {
  return (
    <div className="pa-page ms-page-wrapper ms-container-markets min-w-0" aria-busy="true">
      <div className="motion-shimmer mb-4 h-3 w-28 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-2 h-8 w-48 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-4 h-4 w-72 max-w-full rounded bg-[var(--color-divider)]" />
      <div className="grid gap-3 min-[640px]:grid-cols-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="motion-shimmer h-16 rounded-xl bg-[var(--color-divider)]" />
        ))}
      </div>
      <div className="motion-shimmer mb-4 h-20 rounded-xl bg-[var(--color-divider)]" />
      <div className="pa-skeleton-grid">
        <div className="motion-shimmer h-72 rounded-xl bg-[var(--color-divider)]" />
        <div className="motion-shimmer h-72 rounded-xl bg-[var(--color-divider)]" />
      </div>
    </div>
  );
}

/** `/markets/category/[category]` SSR Suspense fallback */
export function MarketsCategoryPageSkeleton() {
  return (
    <div className="min-w-0" aria-busy="true">
      <div className="motion-shimmer mb-4 h-20 w-full rounded-xl bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-6 h-32 rounded-xl bg-[var(--color-divider)]" />
      <MarketsGridSkeleton count={6} />
    </div>
  );
}

/** Haber / takvim intel sayfaları loading */
export function IntelWorkspaceSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="ms-page-wrapper ms-container-markets min-w-0 py-4" aria-busy="true">
      <div className="motion-shimmer mb-4 h-8 w-56 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-3 h-10 w-full max-w-xl rounded-full bg-[var(--color-divider)]" />
      <SkeletonTimeline count={rows} />
    </div>
  );
}

/** `/market-news` — hero + grid şekilli skeleton */
export function MarketNewsPageSkeleton() {
  return (
    <div
      className="mn-skeleton-page mn-page--premium ms-page-wrapper ms-container-markets min-w-0"
      aria-busy="true"
      aria-label="Haberler yükleniyor"
    >
      <div className="mn-skeleton-header">
        <div className="motion-shimmer h-10 w-56 rounded-md bg-[var(--color-divider)]" />
        <div className="motion-shimmer h-8 w-40 rounded-md bg-[var(--color-divider)]" />
      </div>
      <div className="motion-shimmer mn-skeleton-band bg-[var(--color-divider)]" />
      <div className="mn-skeleton-tabs">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="motion-shimmer mn-skeleton-tab bg-[var(--color-divider)]" />
        ))}
      </div>
      <div className="mn-skeleton-hero">
        <div className="motion-shimmer mn-skeleton-hero-main bg-[var(--color-divider)]" />
        <div className="mn-skeleton-hero-side">
          <div className="motion-shimmer mn-skeleton-hero-side-card bg-[var(--color-divider)]" />
          <div className="motion-shimmer mn-skeleton-hero-side-card bg-[var(--color-divider)]" />
        </div>
      </div>
      <div className="motion-shimmer mb-6 h-4 w-32 rounded bg-[var(--color-divider)]" />
      <div className="mb-6 flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="motion-shimmer h-36 w-64 shrink-0 rounded-lg bg-[var(--color-divider)]" />
        ))}
      </div>
      <div className="mn-skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="motion-shimmer mn-skeleton-grid-card bg-[var(--color-divider)]" />
        ))}
      </div>
    </div>
  );
}

/** `/market-news/[id]` — detay sayfası skeleton */
export function MarketNewsDetailSkeleton() {
  return (
    <div
      className="mnd-skeleton-page mnd-page--premium ms-page-wrapper ms-container-markets min-w-0"
      aria-busy="true"
      aria-label="Haber detayı yükleniyor"
    >
      <div className="motion-shimmer mnd-skeleton-line mb-3 h-8 w-48 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mnd-skeleton-hero bg-[var(--color-divider)]" />
      <div className="mnd-skeleton-content">
        <div className="mnd-skeleton-main">
          <div className="motion-shimmer mnd-skeleton-line w-full bg-[var(--color-divider)]" />
          <div className="motion-shimmer mnd-skeleton-line w-[92%] bg-[var(--color-divider)]" />
          <div className="motion-shimmer mnd-skeleton-line w-[88%] bg-[var(--color-divider)]" />
          <div className="motion-shimmer mnd-skeleton-line w-[70%] bg-[var(--color-divider)]" />
        </div>
        <div className="motion-shimmer mnd-skeleton-rail bg-[var(--color-divider)]" />
      </div>
    </div>
  );
}
