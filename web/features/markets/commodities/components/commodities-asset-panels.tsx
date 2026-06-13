"use client";

import Link from "next/link";

import { CryptoInteractiveAreaChart } from "@/features/markets/crypto/components/crypto-interactive-area-chart";
import { formatCommodityTickerPrice } from "@/features/markets/commodities/lib/map-commodity-tickers";
import type { CommodityAssetPanel } from "@/features/markets/commodities/types";
import { cn } from "@/lib/cn";

type PanelVariant = "gold" | "silver" | "oil";

type Props = {
  altin: CommodityAssetPanel;
  gumus: CommodityAssetPanel;
  petrol: CommodityAssetPanel;
};

const VARIANT: Record<
  PanelVariant,
  { panelClass: string; chartColor: string; icon: string; label: string }
> = {
  gold: { panelClass: "cc-asset-panel--btc", chartColor: "#f97316", icon: "Au", label: "ALTIN" },
  silver: { panelClass: "cc-asset-panel--eth", chartColor: "#ea580c", icon: "Ag", label: "GÜMÜŞ" },
  oil: { panelClass: "cm-asset-panel--oil", chartColor: "#c2410c", icon: "🛢", label: "PETROL WTI" },
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtPrice(n: number, unit: string, symbol: string) {
  if (!n) return "—";
  if (unit === "c/bu") return `${n.toFixed(0)}¢`;
  return formatCommodityTickerPrice(n, symbol);
}

function CommodityPanel({ panel, variant }: { panel: CommodityAssetPanel; variant: PanelVariant }) {
  const { panelClass, chartColor, icon, label } = VARIANT[variant];
  const isUp = panel.changePct >= 0;
  const hasData = panel.price > 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(panel.symbol)}`}
      className={cn("cc-asset-panel block no-underline", panelClass)}
      aria-label={`${label} detayına git`}
    >
      <div className="cc-asset-panel-header">
        <div className={cn("cm-asset-panel-icon", `cm-asset-panel-icon--${variant}`)}>{icon}</div>
        <div className="cm-asset-panel-titles">
          <span className="cc-asset-title">{panel.name.toUpperCase()}</span>
          <span className="cm-asset-panel-meta">
            {panel.unit} · Destek {panel.stats.destek} · Direnç {panel.stats.direnc}
          </span>
        </div>
      </div>

      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{fmtPrice(panel.price, panel.unit, panel.symbol)}</span>
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
        <div className="cm-asset-chart-empty">Kotasyon bekleniyor</div>
      )}
    </Link>
  );
}

export function CommoditiesAssetPanels({ altin, gumus, petrol }: Props) {
  return (
    <div className="cc-asset-panels cc-section cm-asset-panels" role="region" aria-label="Altın, gümüş ve petrol panelleri">
      <CommodityPanel panel={altin} variant="gold" />
      <CommodityPanel panel={gumus} variant="silver" />
      <CommodityPanel panel={petrol} variant="oil" />
    </div>
  );
}
