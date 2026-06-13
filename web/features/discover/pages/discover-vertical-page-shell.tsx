"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { useNudgeLazyMediaWhenReady } from "@/hooks/use-nudge-lazy-media-when-ready";
import type { DiscoverViewModel } from "@/features/discover/visual-reference/discover-view-model-adapter";
import { DiscoverErrorBanner } from "@/features/discover/visual-reference/discover-error-banner";
import { MarketAtmosphereStack } from "@/features/discover/visual-reference/discover-market-strip";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  viewModel: DiscoverViewModel;
  feedLoading?: boolean;
  feedError?: boolean;
  onFeedRetry?: () => void;
  liveDot?: boolean;
  pageTone?: "live" | "pulse" | "videos" | "signals" | "creators";
  /** Başlık / intro chrome yok — doğrudan içerik */
  headless?: boolean;
};

export function DiscoverVerticalPageShell({
  title,
  description,
  children,
  viewModel,
  feedLoading = false,
  feedError = false,
  onFeedRetry,
  liveDot = false,
  pageTone,
  headless = false,
}: Props) {
  useNudgeLazyMediaWhenReady(!feedLoading, pageTone ?? title);

  return (
    <div
      className={cn(
        "dvr-surface dvr-surface--vertical-page",
        pageTone && `dvr-surface--${pageTone}-page`,
        headless && "dvr-surface--headless",
      )}
      aria-busy={feedLoading}
    >
      {feedLoading ? <span className="sr-only">{title} yükleniyor.</span> : null}
      {headless ? <h1 className="sr-only">{title}</h1> : null}

      {!headless ? (
        <header className="dvr-top-chrome">
          <div className="dvr-market-atmosphere">
            <MarketAtmosphereStack tickers={viewModel.marketTickers} />
          </div>

          <div className="dvr-vertical-page-head">
            <div className="dvr-vertical-page-head__row">
              <Link href="/discover" className="dvr-vertical-back">
                ← Keşfet
              </Link>
            </div>
            <div className="dvr-vertical-page-head__title-row">
              {liveDot ? <span className="dvr-vertical-live-dot dvr-live-tab-dot" aria-hidden /> : null}
              <h1 className="dvr-vertical-page-title">{title}</h1>
            </div>
            <p className="dvr-vertical-page-desc">{description}</p>
          </div>
        </header>
      ) : null}

      {feedError && onFeedRetry ? (
        <DiscoverErrorBanner
          title="Akış yüklenemedi"
          message="İçerik şu an görüntülenemiyor. Bağlantını kontrol edip tekrar dene."
          onRetry={onFeedRetry}
        />
      ) : feedError ? (
        <span className="sr-only">Veri yüklenemedi; içerik boş veya geçici olarak kullanılamıyor.</span>
      ) : null}

      <div className="dvr-content dvr-content--vertical-page">{children}</div>
    </div>
  );
}
