"use client";

import { useMemo } from "react";

import { formatBistTickerPrice } from "@/features/markets/bist/lib/map-bist-tickers";
import {
  bistKindLabel,
  isBistIndexSymbol,
  normalizeBistSymbol,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { useBistDetailSparkline } from "@/features/markets/bist/symbol-detail/hooks/use-bist-detail-sparkline";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  liveAsset?: MarketAssetView | null;
};

export function BistDetailSidebarSummary({ bundle, liveAsset }: Props) {
  const sym = normalizeBistSymbol(bundle.asset.symbol);
  const price = liveAsset?.price ?? bundle.asset.price;
  const changePct = liveAsset?.change_percent ?? bundle.asset.change_percent;
  const sparkline = useBistDetailSparkline(sym, "1mo");
  const isIndex = isBistIndexSymbol(sym);

  const rows = useMemo(() => {
    const destek = sparkline.data?.stats.destek ?? "—";
    const direnc = sparkline.data?.stats.direnc ?? "—";
    const haftalik = sparkline.data?.stats.haftalik ?? "—";
    const aylik = sparkline.data?.stats.aylik ?? "—";

    return [
      {
        label: "Son fiyat",
        value: formatBistTickerPrice(sparkline.data?.price ?? price, sym),
      },
      {
        label: "24s değişim",
        value: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
        tone: changePct >= 0 ? ("up" as const) : ("down" as const),
      },
      {
        label: "Destek",
        value: destek,
      },
      {
        label: "Direnç",
        value: direnc,
      },
      {
        label: "Haftalık",
        value: haftalik,
      },
      {
        label: isIndex ? "Endeks tipi" : "Sektör",
        value: isIndex ? "BIST Endeks" : bistKindLabel(sym),
      },
      {
        label: "Aylık",
        value: aylik,
      },
      {
        label: "Veri",
        value: sparkline.data?.source === "yahoo" ? "Yahoo · Canlı" : "Canlı",
      },
    ];
  }, [changePct, isIndex, price, sparkline.data, sym]);

  return (
    <section className="cdr-section cdr-sidebar-block" data-zone="summary" aria-label="Özet">
      <DetailSectionHead
        seriesKicker={sparkline.data ? "Yahoo · Canlı" : "Canlı"}
        label="Piyasa Özeti"
        accent="teal"
        trailing={
          sparkline.data ? (
            <span className="cdr-live-pill cdr-live-pill--on">
              <span className="cdr-live-pill__dot cdr-live-pill__dot--pulse" aria-hidden />
              <span className="cdr-live-pill__text">Canlı</span>
            </span>
          ) : null
        }
      />
      <dl className="bc-summary-grid bc-summary-grid--dense">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd className={cn(row.tone === "up" && "cdr-up", row.tone === "down" && "cdr-down")}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
