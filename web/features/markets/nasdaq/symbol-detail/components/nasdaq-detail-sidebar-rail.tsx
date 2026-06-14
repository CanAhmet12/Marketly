"use client";

import Link from "next/link";

import { nasdaqDisplayLabel } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { NasdaqDetailRelatedSection } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-related-section";
import { NasdaqDetailSidebarAnalystSentiment } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-sidebar-analyst-sentiment";
import { NasdaqDetailSidebarOptions } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-sidebar-options";
import { NasdaqDetailSidebarSpreadSession } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-sidebar-spread-session";
import { NasdaqDetailSidebarSummary } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-sidebar-summary";
import { DetailSidebarConsensus } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-consensus";
import { marketAssetSignalsPath } from "@/features/markets/markets-routes";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  nasdaqAssets: readonly MarketAssetView[];
  liveAsset?: MarketAssetView | null;
  settled?: boolean;
};

export function NasdaqDetailSidebarRail({ bundle, nasdaqAssets, liveAsset, settled = false }: Props) {
  const sym = bundle.asset.symbol.trim().toUpperCase();

  return (
    <aside className="cdr-sidebar-col cdr-sidebar-col--live nqx-sidebar-col">
      <div className={cn("cdr-sidebar-inner", settled && "cdr-sidebar-inner--settled")}>
        <NasdaqDetailSidebarSummary bundle={bundle} liveAsset={liveAsset} />

        <NasdaqDetailSidebarSpreadSession symbol={sym} />
        <NasdaqDetailSidebarOptions symbol={sym} />
        <NasdaqDetailSidebarAnalystSentiment symbol={sym} />
        <DetailSidebarConsensus bundle={bundle} />
        <NasdaqDetailRelatedSection symbol={sym} assets={nasdaqAssets} />

        <section className="cdr-section cdr-sidebar-block" data-zone="signals-link">
          <DetailSectionHead seriesKicker="Akış" label="Sembol Sinyalleri" accent="signal" />
          <Link href={marketAssetSignalsPath(sym)} className="cdr-btn cdr-btn--ghost cdr-btn--wide">
            {nasdaqDisplayLabel(sym, bundle.asset.name)} sinyalleri
          </Link>
        </section>
      </div>
    </aside>
  );
}
