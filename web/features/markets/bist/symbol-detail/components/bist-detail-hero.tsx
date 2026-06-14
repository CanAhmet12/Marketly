"use client";

import Link from "next/link";
import { useMemo } from "react";

import { buildBistDetailPanel } from "@/features/markets/bist/lib/bist-panel-utils";
import { formatBistTickerPrice } from "@/features/markets/bist/lib/map-bist-tickers";
import {
  bistDisplayLabel,
  bistKindLabel,
  isBistIndexSymbol,
  normalizeBistSymbol,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { useBistDetailSparkline } from "@/features/markets/bist/symbol-detail/hooks/use-bist-detail-sparkline";
import {
  IconBell,
  IconBolt,
  IconPortfolio,
} from "@/features/markets/crypto/symbol-detail/components/detail-icons";
import { DetailSparkline } from "@/features/markets/crypto/symbol-detail/components/detail-sparkline";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { marketAssetSignalsPath, marketsCategoryPath } from "@/features/markets/markets-routes";
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
  return isBistIndexSymbol(symbol) ? "puan" : "TL";
}

export function BistDetailHero({
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
  const sym = normalizeBistSymbol(asset.symbol);
  const livePrice = liveAsset?.price ?? asset.price;
  const change = liveAsset?.change_percent ?? asset.change_percent;
  const isUp = change >= 0;
  const kindLabel = bistKindLabel(sym);
  const displayName = bistDisplayLabel(sym, asset.name);
  const sparkQuery = useBistDetailSparkline(sym, "1mo");

  const price = sparkQuery.data?.price ?? livePrice;

  const sparkSeries = useMemo(() => {
    if (sparkQuery.data?.sparkline.length && sparkQuery.data.sparkline.length >= 2) {
      return sparkQuery.data.sparkline;
    }
    const q = liveAsset ?? asset;
    const panel = buildBistDetailPanel(q, sym);
    if (panel.sparkline.length >= 2) return panel.sparkline;
    const p = q.price || 100;
    return [p * 0.992, p * 0.996, p * 0.994, p * 0.998, p];
  }, [sparkQuery.data?.sparkline, liveAsset, asset, sym]);

  return (
    <header className={cn("bc-hero", isUp ? "bc-hero--up" : "bc-hero--down")}>
      <span className="bc-hero__rail" aria-hidden />

      <nav className="bc-hero__crumb" aria-label="Konum">
        <Link href={marketsCategoryPath("bist")}>BIST</Link>
        <span className="bc-hero__crumb-sep">/</span>
        <span>
          {displayName} ({sym})
        </span>
      </nav>

      <div className="bc-hero__main">
        <div className="bc-hero__identity">
          <span className="cdr-badge bc-badge--kind">{kindLabel}</span>
          <h1 className="bc-hero__title">{displayName}</h1>
          <p className="bc-hero__sym">{sym}</p>
        </div>

        <div className="bc-hero__quote">
          <div className="bc-hero__quote-main">
            <span className="bc-hero__price">{formatBistTickerPrice(price, sym)}</span>
            <span className="bc-hero__unit">{unitFor(sym)}</span>
            <span className={cn("bc-hero__chg", isUp ? "cdr-up" : "cdr-down")}>{fmtSignedPct(change)}</span>
          </div>
          <div className="bc-hero__spark">
            <DetailSparkline series={sparkSeries} width={200} height={48} sparkKey={sym} />
          </div>
        </div>
      </div>

      <div className="bc-hero__actions">
        <Link href={marketAssetSignalsPath(sym)} className="cdr-btn cdr-btn--primary">
          <IconBolt />
          Sinyaller
        </Link>
        <button
          type="button"
          className={cn("cdr-btn cdr-btn--ghost", watched && "bc-hero__action--on")}
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
          className={cn("cdr-btn cdr-btn--ghost", inPortfolio && "bc-hero__action--on")}
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
