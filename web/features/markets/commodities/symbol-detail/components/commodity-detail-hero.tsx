"use client";

import Link from "next/link";
import { useMemo } from "react";

import { buildCommodityPanel } from "@/features/markets/commodities/lib/commodity-panel-utils";
import {
  commodityDisplayLabel,
  formatCommodityTickerPrice,
} from "@/features/markets/commodities/lib/map-commodity-tickers";
import { resolveCommodityCategory } from "@/features/markets/commodities/lib/commodity-regime-utils";
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

const CLASS_LABEL: Record<string, string> = {
  "degerli-metal": "Değerli metal",
  enerji: "Enerji",
  tarim: "Tarım",
  endustri: "Endüstri",
  endeks: "Endeks",
};

function unitFor(symbol: string): string {
  const cat = resolveCommodityCategory(symbol);
  if (cat === "degerli-metal") return "$/oz";
  if (cat === "enerji") return "$/bbl";
  if (cat === "tarim") return "c/bu";
  return "$/lb";
}

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

export function CommodityDetailHero({
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
  const commodityClass = resolveCommodityCategory(sym);
  const classLabel = CLASS_LABEL[commodityClass] ?? "Emtia";
  const displayName = commodityDisplayLabel(sym, asset.name);
  const sparkSeries = useMemo(() => {
    const q = liveAsset ?? asset;
    const panel = buildCommodityPanel(q);
    if (panel.sparkline.length >= 2) return panel.sparkline;
    const p = q.price || 100;
    return [p * 0.985, p * 0.992, p * 0.988, p * 0.996, p];
  }, [liveAsset, asset]);

  return (
    <header className={cn("cmr-hero", isUp ? "cmr-hero--up" : "cmr-hero--down")}>
      <span className="cmr-hero__rail" aria-hidden />

      <nav className="cmr-hero__crumb" aria-label="Konum">
        <Link href={detailCategoryHubPath("commodity")}>Emtia</Link>
        <span className="cmr-hero__crumb-sep">/</span>
        <span>
          {displayName} ({sym})
        </span>
      </nav>

      <div className="cmr-hero__main">
        <div className="cmr-hero__identity">
          <span className="cdr-badge cdr-badge--cat-commodity">{classLabel}</span>
          <h1 className="cmr-hero__title">{displayName}</h1>
          <p className="cmr-hero__sym">{sym}</p>
        </div>

        <div className="cmr-hero__quote">
          <div className="cmr-hero__quote-main">
            <span className="cmr-hero__price">{formatCommodityTickerPrice(price, sym)}</span>
            <span className="cmr-hero__unit">{unitFor(sym)}</span>
            <span className={cn("cmr-hero__chg", isUp ? "cdr-up" : "cdr-down")}>{fmtSignedPct(change)}</span>
          </div>
          <div className="cmr-hero__spark">
            <DetailSparkline series={sparkSeries} width={200} height={48} sparkKey={sym} />
          </div>
        </div>
      </div>

      <div className="cmr-hero__actions">
        <Link href={marketAssetSignalsPath(sym)} className="cdr-btn cdr-btn--primary">
          <IconBolt />
          Sinyaller
        </Link>
        <button
          type="button"
          className={cn("cdr-btn cdr-btn--ghost", watched && "cmr-hero__action--on")}
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
          className={cn("cdr-btn cdr-btn--ghost", inPortfolio && "cmr-hero__action--on")}
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
