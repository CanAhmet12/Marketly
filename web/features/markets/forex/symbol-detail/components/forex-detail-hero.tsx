"use client";

import Link from "next/link";
import { useMemo } from "react";

import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import { buildForexPairPanel } from "@/features/markets/forex/lib/forex-pair-panel-utils";
import {
  forexDisplayLabel,
  forexPairCategoryLabel,
  forexPairLabel,
  normalizeForexSymbol,
} from "@/features/markets/forex/lib/forex-symbol-meta";
import { useForexDetailSparkline } from "@/features/markets/forex/symbol-detail/hooks/use-forex-detail-sparkline";
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

export function ForexDetailHero({
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
  const sym = normalizeForexSymbol(asset.symbol);
  const pair = forexPairLabel(sym);
  const price = liveAsset?.price ?? asset.price;
  const change = liveAsset?.change_percent ?? asset.change_percent;
  const isUp = change >= 0;
  const categoryLabel = forexPairCategoryLabel(sym);
  const displayName = forexDisplayLabel(sym, asset.name);
  const sparkQuery = useForexDetailSparkline(sym, "1mo");

  const sparkSeries = useMemo(() => {
    if (sparkQuery.data?.sparkline.length && sparkQuery.data.sparkline.length >= 2) {
      return sparkQuery.data.sparkline;
    }
    const q = liveAsset ?? asset;
    const panel = buildForexPairPanel(q);
    if (panel.sparkline.length >= 2) return panel.sparkline;
    const p = q.price || 1;
    return [p * 0.9995, p * 0.9998, p * 0.9996, p * 0.9999, p];
  }, [sparkQuery.data?.sparkline, liveAsset, asset]);

  return (
    <header className={cn("fx-hero", isUp ? "fx-hero--up" : "fx-hero--down")}>
      <span className="fx-hero__rail" aria-hidden />

      <nav className="fx-hero__crumb" aria-label="Konum">
        <Link href={detailCategoryHubPath("forex")}>Forex</Link>
        <span className="fx-hero__crumb-sep">/</span>
        <span>
          {displayName} ({pair})
        </span>
      </nav>

      <div className="fx-hero__main">
        <div className="fx-hero__identity">
          <span className="cdr-badge fx-badge--pair">{categoryLabel}</span>
          <h1 className="fx-hero__title">{displayName}</h1>
          <p className="fx-hero__sym">{pair}</p>
        </div>

        <div className="fx-hero__quote">
          <div className="fx-hero__quote-main">
            <span className="fx-hero__price">{formatForexTickerPrice(price, sym)}</span>
            <span className="fx-hero__unit">kur</span>
            <span className={cn("fx-hero__chg", isUp ? "cdr-up" : "cdr-down")}>{fmtSignedPct(change)}</span>
          </div>
          <div className="fx-hero__spark">
            <DetailSparkline series={sparkSeries} width={200} height={48} sparkKey={sym} />
          </div>
        </div>
      </div>

      <div className="fx-hero__actions">
        <Link href={marketAssetSignalsPath(sym)} className="cdr-btn cdr-btn--primary">
          <IconBolt />
          Sinyaller
        </Link>
        <button
          type="button"
          className={cn("cdr-btn cdr-btn--ghost", watched && "fx-hero__action--on")}
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
          className={cn("cdr-btn cdr-btn--ghost", inPortfolio && "fx-hero__action--on")}
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
