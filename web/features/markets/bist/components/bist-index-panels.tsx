"use client";

import Link from "next/link";

import { CryptoInteractiveAreaChart } from "@/features/markets/crypto/components/crypto-interactive-area-chart";
import type { BistIndexPanel } from "@/features/markets/bist/types";
import { cn } from "@/lib/cn";

type PanelVariant = "b100" | "b30" | "bank";

type Props = {
  bist100: BistIndexPanel;
  bist30: BistIndexPanel;
  bistBanka: BistIndexPanel;
};

const VARIANT: Record<
  PanelVariant,
  { panelClass: string; chartColor: string; icon: string; label: string }
> = {
  b100: { panelClass: "cc-asset-panel--btc", chartColor: "#3b82f6", icon: "100", label: "BIST 100" },
  b30: { panelClass: "cc-asset-panel--eth", chartColor: "#60a5fa", icon: "30", label: "BIST 30" },
  bank: { panelClass: "bc-asset-panel--bank", chartColor: "#2563eb", icon: "BNK", label: "BIST BANKA" },
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtIndex(n: number) {
  if (!n) return "—";
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function IndexPanel({ panel, variant }: { panel: BistIndexPanel; variant: PanelVariant }) {
  const { panelClass, chartColor, icon, label } = VARIANT[variant];
  const isUp = panel.changePercent >= 0;
  const hasData = panel.value > 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(panel.symbol === "BIST100" ? "XU100" : panel.symbol === "BIST30" ? "XU030" : "XUBANK")}`}
      className={cn("cc-asset-panel block no-underline", panelClass)}
      aria-label={`${label} detayına git`}
    >
      <div className="cc-asset-panel-header">
        <div className={cn("bc-asset-panel-icon", `bc-asset-panel-icon--${variant}`)}>{icon}</div>
        <div className="bc-asset-panel-titles">
          <span className="cc-asset-title">{panel.name}</span>
          <span className="bc-asset-panel-meta">
            Yüksek {panel.stats.highDay} · Düşük {panel.stats.lowDay}
          </span>
        </div>
      </div>

      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{fmtIndex(panel.value)}</span>
        {hasData ? (
          <span className={cn("cc-asset-change", isUp ? "cc-up" : "cc-down")}>{signed(panel.changePercent)}</span>
        ) : (
          <span className="cc-asset-change cc-neutral">—</span>
        )}
      </div>

      <div className="cc-asset-stats-row">
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Piyasa Değeri</span>
          <span className="cc-asset-stat-value">{panel.stats.marketCap}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Hacim</span>
          <span className="cc-asset-stat-value">{panel.stats.volume}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Gün Yüksek</span>
          <span className="cc-asset-stat-value cc-up">{panel.stats.highDay}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Gün Düşük</span>
          <span className="cc-asset-stat-value cc-down">{panel.stats.lowDay}</span>
        </div>
      </div>

      {hasData && panel.sparkline.length >= 2 ? (
        <div className="cc-asset-chart-wrap">
          <CryptoInteractiveAreaChart series={panel.sparkline} color={chartColor} height={132} />
        </div>
      ) : (
        <div className="bc-asset-chart-empty">Kotasyon bekleniyor</div>
      )}
    </Link>
  );
}

export function BistIndexPanels({ bist100, bist30, bistBanka }: Props) {
  return (
    <div className="cc-asset-panels cc-section bc-asset-panels" role="region" aria-label="BIST endeks panelleri">
      <IndexPanel panel={bist100} variant="b100" />
      <IndexPanel panel={bist30} variant="b30" />
      <IndexPanel panel={bistBanka} variant="bank" />
    </div>
  );
}
