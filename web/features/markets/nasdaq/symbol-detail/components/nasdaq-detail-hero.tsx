"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  formatNasdaqTickerPrice,
} from "@/features/markets/nasdaq/lib/map-nasdaq-tickers";
import { buildNasdaqIndexPanel } from "@/features/markets/nasdaq/lib/nasdaq-panel-utils";
import {
  isNasdaqIndexSymbol,
  nasdaqDisplayLabel,
  nasdaqSectorLabel,
} from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { useNasdaqDetailSparkline } from "@/features/markets/nasdaq/symbol-detail/hooks/use-nasdaq-detail-sparkline";
import {
  IconBell,
  IconBolt,
  IconPortfolio,
} from "@/features/markets/crypto/symbol-detail/components/detail-icons";
import { DetailSparkline } from "@/features/markets/crypto/symbol-detail/components/detail-sparkline";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { detailCategoryHubPath } from "@/features/markets/symbol-detail-core/lib/category-meta";
import { marketAssetSignalsPath } from "@/features/markets/markets-routes";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  liveAsset?: MarketAssetView | null;
  watched: boolean;
  inPortfolio: boolean;
  alertCount?: number;
  onToggleWatch: () => void;
  onTogglePortfolio: () => void;
  onOpenAlerts: () => void;
};

function unitFor(symbol: string): string {
  return isNasdaqIndexSymbol(symbol) ? "puan" : "USD";
}

function badgeClass(symbol: string): string {
  return isNasdaqIndexSymbol(symbol) ? "cdr-badge--cat-index" : "cdr-badge--cat-stock";
}

export function NasdaqDetailHero({
  bundle,
  liveAsset,
  watched,
  inPortfolio,
  alertCount = 0,
  onToggleWatch,
  onTogglePortfolio,
  onOpenAlerts,
}: Props) {
  const { asset } = bundle;
  const sym = asset.symbol.trim().toUpperCase();
  const price = liveAsset?.price ?? asset.price;
  const change = liveAsset?.change_percent ?? asset.change_percent;
  const isUp = change >= 0;
  const sectorLabel = nasdaqSectorLabel(sym);
  const displayName = nasdaqDisplayLabel(sym, asset.name);
  const hubCategory = isNasdaqIndexSymbol(sym) ? "index" : "stocks";
  const sparkQuery = useNasdaqDetailSparkline(sym, "1mo");

  const sparkSeries = useMemo(() => {
    if (sparkQuery.data?.sparkline.length && sparkQuery.data.sparkline.length >= 2) {
      return sparkQuery.data.sparkline;
    }
    const q = liveAsset ?? asset;
    const panel = buildNasdaqIndexPanel(q);
    if (panel.sparkline.length >= 2) return panel.sparkline;
    const p = q.price || 100;
    return [p * 0.985, p * 0.992, p * 0.988, p * 0.996, p];
  }, [sparkQuery.data?.sparkline, liveAsset, asset]);

  return (
    <header className={cn("nqx-hero", isUp ? "nqx-hero--up" : "nqx-hero--down")}>
      <span className="nqx-hero__rail" aria-hidden />

      <nav className="nqx-hero__crumb" aria-label="Konum">
        <Link href={detailCategoryHubPath(hubCategory)}>NASDAQ</Link>
        <span className="nqx-hero__crumb-sep">/</span>
        <span>
          {displayName} ({sym})
        </span>
      </nav>

      <div className="nqx-hero__main">
        <div className="nqx-hero__identity">
          <span className={cn("cdr-badge", badgeClass(sym))}>{sectorLabel}</span>
          <h1 className="nqx-hero__title">{displayName}</h1>
          <p className="nqx-hero__sym">{sym}</p>
        </div>

        <div className="nqx-hero__quote">
          <div className="nqx-hero__quote-main">
            <span className="nqx-hero__price">{formatNasdaqTickerPrice(price, sym)}</span>
            <span className="nqx-hero__unit">{unitFor(sym)}</span>
            <span className={cn("nqx-hero__chg", isUp ? "cdr-up" : "cdr-down")}>{fmtSignedPct(change)}</span>
          </div>
          <div className="nqx-hero__spark">
            <DetailSparkline series={sparkSeries} width={200} height={48} sparkKey={sym} />
          </div>
        </div>
      </div>

      <div className="nqx-hero__actions">
        <Link href={marketAssetSignalsPath(sym)} className="cdr-btn cdr-btn--primary">
          <IconBolt />
          Sinyaller
        </Link>
        <button
          type="button"
          className={cn("cdr-btn cdr-btn--ghost", watched && "nqx-hero__action--on")}
          onClick={onToggleWatch}
          aria-pressed={watched}
        >
          {watched ? "Takipte" : "Takip et"}
        </button>
        <button type="button" className="cdr-btn cdr-btn--ghost" onClick={onOpenAlerts}>
          <IconBell />
          Alarm{alertCount > 0 ? ` (${alertCount})` : ""}
        </button>
        <button
          type="button"
          className={cn("cdr-btn cdr-btn--ghost", inPortfolio && "nqx-hero__action--on")}
          onClick={onTogglePortfolio}
          aria-pressed={inPortfolio}
        >
          <IconPortfolio />
          {inPortfolio ? "Portföyde" : "Portföye ekle"}
        </button>
      </div>
    </header>
  );
}
