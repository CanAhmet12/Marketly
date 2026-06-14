"use client";

import Link from "next/link";

import { forexDisplayLabel, normalizeForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";
import { ForexDetailSidebarCarrySwap } from "@/features/markets/forex/symbol-detail/components/forex-detail-sidebar-carry-swap";
import { ForexDetailSidebarMacroSentiment } from "@/features/markets/forex/symbol-detail/components/forex-detail-sidebar-macro-sentiment";
import { ForexDetailSidebarSpreadSession } from "@/features/markets/forex/symbol-detail/components/forex-detail-sidebar-spread-session";
import { ForexDetailSidebarSummary } from "@/features/markets/forex/symbol-detail/components/forex-detail-sidebar-summary";
import { ForexDetailRelatedSection } from "@/features/markets/forex/symbol-detail/components/forex-detail-related-section";
import { DetailSidebarConsensus } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-consensus";
import { marketAssetSignalsPath } from "@/features/markets/markets-routes";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  forexAssets: readonly MarketAssetView[];
  liveAsset?: MarketAssetView | null;
  settled?: boolean;
};

export function ForexDetailSidebarRail({ bundle, forexAssets, liveAsset, settled = false }: Props) {
  const sym = normalizeForexSymbol(bundle.asset.symbol);
  const display = forexDisplayLabel(sym, bundle.asset.name);

  return (
    <aside className="cdr-sidebar-col cdr-sidebar-col--live fx-sidebar-col">
      <div className={cn("cdr-sidebar-inner", settled && "cdr-sidebar-inner--settled")}>
        <ForexDetailSidebarSummary bundle={bundle} liveAsset={liveAsset} />

        <ForexDetailSidebarSpreadSession symbol={sym} />
        <ForexDetailSidebarCarrySwap symbol={sym} />
        <ForexDetailSidebarMacroSentiment symbol={sym} />

        <DetailSidebarConsensus bundle={bundle} />
        <ForexDetailRelatedSection symbol={sym} assets={forexAssets} />

        <section className="cdr-section cdr-sidebar-block" data-zone="signals-link">
          <DetailSectionHead seriesKicker="Akış" label="Sembol Sinyalleri" accent="signal" />
          <Link href={marketAssetSignalsPath(sym)} className="cdr-btn cdr-btn--ghost cdr-btn--wide">
            {display} sinyalleri
          </Link>
        </section>
      </div>
    </aside>
  );
}
