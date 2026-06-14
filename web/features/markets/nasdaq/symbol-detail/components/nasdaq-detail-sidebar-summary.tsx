"use client";

import { useMemo } from "react";

import { isNasdaqIndexSymbol } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { useNasdaqDetailFundamentals } from "@/features/markets/nasdaq/symbol-detail/hooks/use-nasdaq-fundamentals";
import { useNasdaqDetailSpreadSession } from "@/features/markets/nasdaq/symbol-detail/hooks/use-nasdaq-spread-session";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  liveAsset?: MarketAssetView | null;
};

export function NasdaqDetailSidebarSummary({ bundle, liveAsset }: Props) {
  const sym = bundle.asset.symbol.trim().toUpperCase();
  const changePct = liveAsset?.change_percent ?? bundle.asset.change_percent;
  const fundamentals = useNasdaqDetailFundamentals(sym, bundle.asset.name);
  const spreadSession = useNasdaqDetailSpreadSession(sym);

  const rows = useMemo(() => {
    const isIndex = isNasdaqIndexSymbol(sym);
    const sessionLabel =
      spreadSession.data?.session.label ??
      bundle.session.headline ??
      "US seansı";

    return [
      {
        label: "Hacim",
        value: liveAsset?.volume || bundle.asset.volume || "—",
      },
      {
        label: isIndex ? "Endeks tipi" : "Piyasa değeri",
        value: isIndex
          ? "US endeks"
          : fundamentals.data?.marketCap || bundle.asset.marketCapLabel || "—",
      },
      {
        label: isIndex ? "Bileşen ort." : "F/K",
        value: isIndex
          ? fundamentals.data?.peRatio ?? "—"
          : fundamentals.data?.peRatio || "—",
      },
      {
        label: "24s değişim",
        value: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
        tone: changePct >= 0 ? ("up" as const) : ("down" as const),
      },
      {
        label: "Oturum",
        value: sessionLabel,
      },
      {
        label: "52H yüksek",
        value: fundamentals.data?.stats.fiftyTwoWeekHigh ?? "—",
      },
    ];
  }, [
    bundle.asset.marketCapLabel,
    bundle.asset.volume,
    bundle.session.headline,
    changePct,
    fundamentals.data,
    liveAsset?.volume,
    spreadSession.data?.session.label,
    sym,
  ]);

  return (
    <section className="cdr-section cdr-sidebar-block" data-zone="summary" aria-label="Özet">
      <DetailSectionHead
        seriesKicker={fundamentals.data?.source === "yahoo" ? "Yahoo · Canlı" : "Canlı"}
        label="Piyasa Özeti"
        accent="teal"
      />
      <dl className="nqx-summary-grid nqx-summary-grid--dense">
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
