"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { DISCOVER_HUB_PATH } from "@/features/discover/routes";
import type { DiscoverViewModel } from "@/features/discover/visual-reference/discover-view-model-adapter";
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
}: Props) {
  return (
    <div className="dvr-surface dvr-surface--vertical-page" aria-busy={feedLoading}>
      {feedLoading ? <span className="sr-only">{title} yükleniyor.</span> : null}

      <header className="dvr-top-chrome">
        <div className="dvr-market-atmosphere">
          <MarketAtmosphereStack tickers={viewModel.marketTickers} />
        </div>

        <div className="dvr-vertical-page-head">
          <div className="dvr-vertical-page-head__row">
            <Link href={DISCOVER_HUB_PATH} className="dvr-vertical-back">
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

      {feedError && onFeedRetry ? (
        <div className="dvr-error-banner" role="alert">
          <p className="dvr-error-banner__text">Akış yüklenemedi. İçerik şu an görüntülenemiyor.</p>
          <button type="button" className="dvr-error-banner__retry" onClick={onFeedRetry}>
            Tekrar dene
          </button>
        </div>
      ) : feedError ? (
        <span className="sr-only">Veri yüklenemedi; içerik boş veya geçici olarak kullanılamıyor.</span>
      ) : null}

      <div className="dvr-content dvr-content--vertical-page">{children}</div>
    </div>
  );
}
