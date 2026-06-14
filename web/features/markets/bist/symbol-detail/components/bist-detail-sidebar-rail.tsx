"use client";

import Link from "next/link";
import { useMemo } from "react";

import { formatBistTickerPrice } from "@/features/markets/bist/lib/map-bist-tickers";
import {
  bistDisplayLabel,
  normalizeBistSymbol,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { BistDetailSidebarMacroFx } from "@/features/markets/bist/symbol-detail/components/bist-detail-sidebar-macro-fx";
import { BistDetailSidebarSpreadSession } from "@/features/markets/bist/symbol-detail/components/bist-detail-sidebar-spread-session";
import { BistDetailSidebarSummary } from "@/features/markets/bist/symbol-detail/components/bist-detail-sidebar-summary";
import { BistDetailSidebarVolumeForeign } from "@/features/markets/bist/symbol-detail/components/bist-detail-sidebar-volume-foreign";
import { DetailSparkline } from "@/features/markets/crypto/symbol-detail/components/detail-sparkline";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { sparkOrFlat } from "@/features/markets/lib/live-category/live-category-shared";
import { marketAssetSignalsPath, marketsCategoryPath } from "@/features/markets/markets-routes";
import { DetailSidebarConsensus } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-consensus";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  bistAssets: readonly MarketAssetView[];
  liveAsset?: MarketAssetView | null;
  settled?: boolean;
};

function pickRelated(assets: readonly MarketAssetView[], symbol: string, limit: number) {
  const sym = normalizeBistSymbol(symbol);
  return assets
    .filter((a) => normalizeBistSymbol(a.symbol) !== sym)
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, limit);
}

export function BistDetailSidebarRail({ bundle, bistAssets, liveAsset, settled = false }: Props) {
  const sym = normalizeBistSymbol(bundle.asset.symbol);
  const display = bistDisplayLabel(sym, bundle.asset.name);
  const related = useMemo(() => pickRelated(bistAssets, sym, 6), [bistAssets, sym]);

  return (
    <aside className="cdr-sidebar-col cdr-sidebar-col--live bc-sidebar-col">
      <div className={cn("cdr-sidebar-inner", settled && "cdr-sidebar-inner--settled")}>
        <BistDetailSidebarSummary bundle={bundle} liveAsset={liveAsset} />

        <BistDetailSidebarSpreadSession symbol={sym} />
        <BistDetailSidebarVolumeForeign
          symbol={sym}
          changePct={liveAsset?.change_percent ?? bundle.asset.change_percent}
        />
        <BistDetailSidebarMacroFx symbol={sym} />

        <DetailSidebarConsensus bundle={bundle} />

        <section
          className="cdr-section cdr-sidebar-block cdr-sidebar-block--correlation"
          data-zone="related-sidebar"
          aria-label="İlgili BIST varlıkları"
        >
          <DetailSectionHead
            seriesKicker="BIST"
            label="İlgili Varlıklar"
            accent="teal"
            seeAllHref={marketsCategoryPath("bist")}
            seeAllLabel="Tümü →"
          />

          {related.length === 0 ? (
            <p className="cdr-section-stub">İlgili BIST kotasyonu şu an kullanılamıyor.</p>
          ) : (
            <ul className="cdr-corr-stack">
              {related.map((card) => {
                const key = normalizeBistSymbol(card.symbol);
                const up = card.change_percent >= 0;
                const label = bistDisplayLabel(key, card.name);
                return (
                  <li key={key}>
                    <Link href={`/markets/${encodeURIComponent(key)}`} className="cdr-corr-card">
                      <span className="cdr-corr-card__icon bc-corr-card__icon">{key.slice(0, 2)}</span>
                      <span className="cdr-corr-card__meta">
                        <span className="cdr-corr-card__sym">{key}</span>
                        <span className="cdr-corr-card__name">{label}</span>
                      </span>
                      <span className="cdr-corr-card__quote">
                        <span className="cdr-corr-card__price">
                          {formatBistTickerPrice(card.price, key)}
                        </span>
                        <span className={cn("cdr-corr-card__chg", up ? "cdr-up" : "cdr-down")}>
                          {fmtSignedPct(card.change_percent)}
                        </span>
                      </span>
                      <DetailSparkline series={sparkOrFlat(card)} width={52} height={22} sparkKey={key} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

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
