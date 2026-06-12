"use client";

import Link from "next/link";

import { CryptoInteractiveAreaChart } from "@/features/markets/crypto/components/crypto-interactive-area-chart";
import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import type { ForexPairPanel } from "@/features/markets/forex/types";
import { cn } from "@/lib/cn";

type PanelVariant = "eur" | "gbp" | "jpy";

type Props = {
  eurusd: ForexPairPanel;
  gbpusd: ForexPairPanel;
  usdjpy: ForexPairPanel;
};

const VARIANT: Record<
  PanelVariant,
  { panelClass: string; chartColor: string; icon: string; label: string }
> = {
  eur: { panelClass: "cc-asset-panel--btc", chartColor: "#8b5cf6", icon: "€/$", label: "EUR/USD" },
  gbp: { panelClass: "cc-asset-panel--eth", chartColor: "#6366f1", icon: "£/$", label: "GBP/USD" },
  jpy: { panelClass: "fc-asset-panel--jpy", chartColor: "#0ea5e9", icon: "¥/$", label: "USD/JPY" },
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtRate(n: number, pair: string) {
  if (!n) return "—";
  return formatForexTickerPrice(n, pair.replace("/", ""));
}

function PairPanel({ panel, variant }: { panel: ForexPairPanel; variant: PanelVariant }) {
  const { panelClass, chartColor, icon, label } = VARIANT[variant];
  const isUp = panel.changePct >= 0;
  const hasData = panel.rate > 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(panel.symbol)}`}
      className={cn("cc-asset-panel block no-underline", panelClass)}
      aria-label={`${label} detayına git`}
    >
      <div className="cc-asset-panel-header">
        <div className={cn("fc-asset-panel-icon", `fc-asset-panel-icon--${variant}`)}>{icon}</div>
        <div className="fc-asset-panel-titles">
          <span className="cc-asset-title">{panel.pair}</span>
          <span className="fc-asset-panel-meta">
            Bid {fmtRate(panel.bid, panel.pair)} · Ask {fmtRate(panel.ask, panel.pair)} · Spread{" "}
            {panel.spread.toFixed(1)} pip
          </span>
        </div>
      </div>

      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{fmtRate(panel.rate, panel.pair)}</span>
        {hasData ? (
          <span className={cn("cc-asset-change", isUp ? "cc-up" : "cc-down")}>{signed(panel.changePct)}</span>
        ) : (
          <span className="cc-asset-change cc-neutral">—</span>
        )}
      </div>

      <div className="cc-asset-stats-row">
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Gün Yüksek</span>
          <span className={cn("cc-asset-stat-value", hasData && "cc-up")}>{panel.stats.dayHigh}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Gün Düşük</span>
          <span className={cn("cc-asset-stat-value", hasData && "cc-down")}>{panel.stats.dayLow}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Pip Aralığı</span>
          <span className="cc-asset-stat-value">{panel.stats.pipRange} pip</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Haftalık</span>
          <span
            className={cn(
              "cc-asset-stat-value",
              panel.stats.weeklyChange.startsWith("+") ? "cc-up" : panel.stats.weeklyChange.startsWith("-") ? "cc-down" : "",
            )}
          >
            {panel.stats.weeklyChange}
          </span>
        </div>
      </div>

      {hasData && panel.sparkline.length >= 2 ? (
        <div className="cc-asset-chart-wrap">
          <CryptoInteractiveAreaChart series={panel.sparkline} color={chartColor} height={132} />
        </div>
      ) : (
        <div className="fc-asset-chart-empty">Kotasyon bekleniyor</div>
      )}
    </Link>
  );
}

export function ForexPairPanels({ eurusd, gbpusd, usdjpy }: Props) {
  return (
    <div className="cc-asset-panels cc-section fc-asset-panels" role="region" aria-label="Majör parite panelleri">
      <PairPanel panel={eurusd} variant="eur" />
      <PairPanel panel={gbpusd} variant="gbp" />
      <PairPanel panel={usdjpy} variant="jpy" />
    </div>
  );
}
