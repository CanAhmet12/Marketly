"use client";

import Link from "next/link";

import { commodityDisplayLabel } from "@/features/markets/commodities/lib/map-commodity-tickers";
import { CommodityDetailRelatedSection } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-related-section";
import { CommodityDetailSidebarDerivatives } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-sidebar-derivatives";
import { CommodityDetailSidebarMacroSentiment } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-sidebar-macro-sentiment";
import { CommodityDetailSidebarSpreadSession } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-sidebar-spread-session";
import { DetailSidebarConsensus } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-consensus";
import { marketAssetSignalsPath } from "@/features/markets/markets-routes";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  commodityAssets: readonly MarketAssetView[];
  settled?: boolean;
};

export function CommodityDetailSidebarRail({ bundle, commodityAssets, settled = false }: Props) {
  const sym = bundle.asset.symbol.trim().toUpperCase();

  return (
    <aside className="cdr-sidebar-col cdr-sidebar-col--live cmr-sidebar-col">
      <div className={cn("cdr-sidebar-inner", settled && "cdr-sidebar-inner--settled")}>
        <section className="cdr-section cdr-sidebar-block" data-zone="summary" aria-label="Özet">
          <DetailSectionHead seriesKicker="Canlı" label="Piyasa Özeti" accent="teal" />
          <dl className="cmr-summary-grid">
            <div>
              <dt>Hacim</dt>
              <dd>{bundle.asset.volume || "—"}</dd>
            </div>
            <div>
              <dt>Piyasa değeri</dt>
              <dd>{bundle.asset.marketCapLabel || "—"}</dd>
            </div>
            <div>
              <dt>24s değişim</dt>
              <dd className={bundle.asset.change_percent >= 0 ? "cdr-up" : "cdr-down"}>
                {bundle.asset.change_percent >= 0 ? "+" : ""}
                {bundle.asset.change_percent.toFixed(2)}%
              </dd>
            </div>
            <div>
              <dt>Oturum</dt>
              <dd>{bundle.session.headline || "Emtia masası"}</dd>
            </div>
          </dl>
        </section>

        <CommodityDetailSidebarSpreadSession symbol={sym} />
        <CommodityDetailSidebarDerivatives symbol={sym} />
        <CommodityDetailSidebarMacroSentiment symbol={sym} />
        <DetailSidebarConsensus bundle={bundle} />
        <CommodityDetailRelatedSection symbol={sym} assets={commodityAssets} />

        <section className="cdr-section cdr-sidebar-block" data-zone="signals-link">
          <DetailSectionHead seriesKicker="Akış" label="Sembol Sinyalleri" accent="signal" />
          <Link href={marketAssetSignalsPath(sym)} className="cdr-btn cdr-btn--ghost cdr-btn--wide">
            {commodityDisplayLabel(sym, bundle.asset.name)} sinyalleri
          </Link>
        </section>
      </div>
    </aside>
  );
}
