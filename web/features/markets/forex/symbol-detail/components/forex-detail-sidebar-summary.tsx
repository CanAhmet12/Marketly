"use client";

import { useMemo } from "react";

import { formatPipCount } from "@/features/markets/forex/lib/forex-pip-utils";
import { activeForexSessionLabel } from "@/features/markets/forex/lib/forex-pulse-utils";
import { normalizeForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";
import { useForexDetailSparkline } from "@/features/markets/forex/symbol-detail/hooks/use-forex-detail-sparkline";
import { useForexDetailSpreadSession } from "@/features/markets/forex/symbol-detail/hooks/use-forex-spread-session";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  liveAsset?: MarketAssetView | null;
};

export function ForexDetailSidebarSummary({ bundle, liveAsset }: Props) {
  const sym = normalizeForexSymbol(bundle.asset.symbol);
  const changePct = liveAsset?.change_percent ?? bundle.asset.change_percent;
  const sparkline = useForexDetailSparkline(sym, "1d");
  const spreadSession = useForexDetailSpreadSession(sym);

  const rows = useMemo(() => {
    const spreadLabel = spreadSession.data
      ? `${formatPipCount(Math.round(spreadSession.data.spread.spreadPips))} · ${spreadSession.data.spread.spreadLabel}`
      : "—";

    const sessionLabel =
      spreadSession.data?.session.label ?? activeForexSessionLabel();
    const pipRangeLabel = sparkline.data?.stats.pipRange ?? "—";
    const dxyDelta = spreadSession.data?.benchmark.deltaPct;

    return [
      {
        label: "Spread",
        value: spreadLabel,
      },
      {
        label: "24s değişim",
        value: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
        tone: changePct >= 0 ? ("up" as const) : ("down" as const),
      },
      {
        label: "Pip aralık",
        value: pipRangeLabel,
      },
      {
        label: "Oturum",
        value: sessionLabel,
      },
      {
        label: "DXY 24s",
        value: dxyDelta != null ? fmtSignedPct(dxyDelta) : "—",
        tone: dxyDelta != null ? (dxyDelta >= 0 ? ("up" as const) : ("down" as const)) : undefined,
      },
      {
        label: "Veri",
        value: spreadSession.data?.source === "yahoo" ? "Yahoo · Canlı" : "Canlı",
      },
    ];
  }, [
    changePct,
    sparkline.data?.stats.pipRange,
    spreadSession.data,
  ]);

  return (
    <section className="cdr-section cdr-sidebar-block" data-zone="summary" aria-label="Özet">
      <DetailSectionHead
        seriesKicker={spreadSession.data ? "Yahoo · Canlı" : "Canlı"}
        label="Piyasa Özeti"
        accent="teal"
        trailing={
          spreadSession.data ? (
            <span className="cdr-live-pill cdr-live-pill--on">
              <span className="cdr-live-pill__dot cdr-live-pill__dot--pulse" aria-hidden />
              <span className="cdr-live-pill__text">Canlı</span>
            </span>
          ) : null
        }
      />
      <dl className="fx-summary-grid fx-summary-grid--dense">
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
