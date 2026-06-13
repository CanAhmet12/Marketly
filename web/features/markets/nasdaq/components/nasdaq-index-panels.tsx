"use client";

import Link from "next/link";

import { CryptoInteractiveAreaChart } from "@/features/markets/crypto/components/crypto-interactive-area-chart";
import type { NasdaqIndexPanel } from "@/features/markets/nasdaq/types";
import { cn } from "@/lib/cn";

type PanelVariant = "ndx" | "comp" | "spx";

type Props = {
  ndx: NasdaqIndexPanel;
  composite: NasdaqIndexPanel;
  sp500: NasdaqIndexPanel;
};

const VARIANT: Record<
  PanelVariant,
  { panelClass: string; chartColor: string; icon: string; label: string }
> = {
  ndx: { panelClass: "cc-asset-panel--btc", chartColor: "#06b6d4", icon: "NDX", label: "NASDAQ 100" },
  comp: { panelClass: "cc-asset-panel--eth", chartColor: "#0891b2", icon: "NAS", label: "COMPOSITE" },
  spx: { panelClass: "nq-asset-panel--spx", chartColor: "#0e7490", icon: "SPX", label: "S&P 500" },
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function IndexPanel({ panel, variant }: { panel: NasdaqIndexPanel; variant: PanelVariant }) {
  const { panelClass, chartColor, icon, label } = VARIANT[variant];
  const isUp = panel.changePct >= 0;
  const hasData = panel.value > 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(panel.symbol)}`}
      className={cn("cc-asset-panel block no-underline", panelClass)}
      aria-label={`${label} detayına git`}
    >
      <div className="cc-asset-panel-header">
        <div className={cn("nq-asset-panel-icon", `nq-asset-panel-icon--${variant}`)}>{icon}</div>
        <div className="nq-asset-panel-titles">
          <span className="cc-asset-title">{panel.name}</span>
          <span className="nq-asset-panel-meta">
            Destek {panel.stats.destek} · Direnç {panel.stats.direnc}
          </span>
        </div>
      </div>

      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{hasData ? panel.value.toLocaleString("en-US") : "—"}</span>
        {hasData ? (
          <span className={cn("cc-asset-change", isUp ? "cc-up" : "cc-down")}>{signed(panel.changePct)}</span>
        ) : (
          <span className="cc-asset-change cc-neutral">—</span>
        )}
      </div>

      <div className="cc-asset-stats-row">
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Haftalık</span>
          <span
            className={cn(
              "cc-asset-stat-value",
              panel.stats.haftalik.startsWith("+") ? "cc-up" : panel.stats.haftalik.startsWith("-") ? "cc-down" : "",
            )}
          >
            {panel.stats.haftalik}
          </span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Aylık</span>
          <span
            className={cn(
              "cc-asset-stat-value",
              panel.stats.aylik.startsWith("+") ? "cc-up" : panel.stats.aylik.startsWith("-") ? "cc-down" : "",
            )}
          >
            {panel.stats.aylik}
          </span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Destek</span>
          <span className="cc-asset-stat-value">{panel.stats.destek}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Direnç</span>
          <span className="cc-asset-stat-value">{panel.stats.direnc}</span>
        </div>
      </div>

      {hasData && panel.sparkline.length >= 2 ? (
        <div className="cc-asset-chart-wrap">
          <CryptoInteractiveAreaChart series={panel.sparkline} color={chartColor} height={132} />
        </div>
      ) : (
        <div className="nq-asset-chart-empty">Kotasyon bekleniyor</div>
      )}
    </Link>
  );
}

export function NasdaqIndexPanels({ ndx, composite, sp500 }: Props) {
  return (
    <div className="cc-asset-panels cc-section nq-asset-panels" role="region" aria-label="Endeks panelleri">
      <IndexPanel panel={ndx} variant="ndx" />
      <IndexPanel panel={composite} variant="comp" />
      <IndexPanel panel={sp500} variant="spx" />
    </div>
  );
}
