"use client";

import Link from "next/link";
import { useMemo } from "react";

import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import { buildCryptoTreemapCells } from "@/features/markets/crypto/lib/build-crypto-treemap";
import { treemapDominanceSummary } from "@/features/markets/crypto/lib/layout-crypto-treemap";
import type { CryptoScreenerAsset, CryptoTreemapCell, CryptoTreemapPayload } from "@/features/markets/crypto/types";
import { cn } from "@/lib/cn";

type Props = {
  screenerAssets: readonly CryptoScreenerAsset[];
  treemap?: CryptoTreemapPayload;
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function stripTone(symbol: string, change: number) {
  if (symbol === "BTC") return "cc-tmap-seg--btc";
  if (symbol === "ETH") return "cc-tmap-seg--eth";
  if (symbol === "SOL") return "cc-tmap-seg--sol";
  if (change >= 2) return "cc-tmap-seg--up";
  if (change <= -2) return "cc-tmap-seg--down";
  return "cc-tmap-seg--neutral";
}

function tileTone(symbol: string, change: number) {
  if (symbol === "BTC") return "cc-tmap-tile--btc";
  if (symbol === "ETH") return "cc-tmap-tile--eth";
  if (symbol === "SOL") return "cc-tmap-tile--sol";
  if (change >= 2) return "cc-tmap-tile--up";
  if (change <= -2) return "cc-tmap-tile--down";
  return "";
}

function WeightTile({ cell }: { cell: CryptoTreemapCell }) {
  const isUp = cell.change24h >= 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(cell.symbol)}`}
      className={cn("cc-tmap-tile", tileTone(cell.symbol, cell.change24h))}
      aria-label={`${cell.name} ${cell.weightPct.toFixed(1)}% ağırlık ${signed(cell.change24h)}`}
    >
      <div className="cc-tmap-tile-head">
        <MarketSymbolIcon symbol={cell.symbol} size={24} />
        <span className="cc-tmap-tile-rank">#{cell.rank}</span>
      </div>
      <div className="cc-tmap-tile-body">
        <span className="cc-tmap-tile-symbol">{cell.symbol}</span>
        <span className="cc-tmap-tile-name">{cell.name}</span>
      </div>
      <div className="cc-tmap-tile-foot">
        <span className={cn("cc-tmap-tile-change", isUp ? "cc-up" : "cc-down")}>
          {signed(cell.change24h)}
        </span>
        <span className="cc-tmap-tile-weight">{cell.weightPct.toFixed(1)}%</span>
      </div>
    </Link>
  );
}

export function CryptoSegmentTreemap({ screenerAssets, treemap }: Props) {
  const cells = useMemo(
    () => treemap?.cells ?? buildCryptoTreemapCells(screenerAssets),
    [screenerAssets, treemap],
  );

  const { top3, top3Weight } = useMemo(() => treemapDominanceSummary(cells), [cells]);

  if (cells.length < 4) return null;

  return (
    <section className="cc-section cc-tmap" role="region" aria-label="Piyasa ağırlığı">
      <div className="cc-tmap-head">
        <div className="cc-zone-label cc-zone-label--flush">
          Piyasa ağırlığı
          <Link href="/markets" className="cc-zone-label-link">
            Tüm varlıklar →
          </Link>
        </div>
        <div className="cc-tmap-kpis">
          <div className="cc-tmap-kpi">
            <span className="cc-tmap-kpi-label">İlk 3 dominans</span>
            <span className="cc-tmap-kpi-value">{top3Weight.toFixed(1)}%</span>
          </div>
          {top3.map((cell) => (
            <div key={cell.symbol} className="cc-tmap-kpi cc-tmap-kpi--chip">
              <MarketSymbolIcon symbol={cell.symbol} size={18} />
              <span className="cc-tmap-kpi-symbol">{cell.symbol}</span>
              <span className={cn("cc-tmap-kpi-change", cell.change24h >= 0 ? "cc-up" : "cc-down")}>
                {signed(cell.change24h)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="cc-tmap-strip" aria-hidden>
        {cells.map((cell) => (
          <span
            key={cell.symbol}
            className={cn("cc-tmap-seg", stripTone(cell.symbol, cell.change24h))}
            style={{ flexGrow: Math.max(0.5, cell.weightPct) }}
            title={`${cell.symbol} ${cell.weightPct.toFixed(1)}%`}
          />
        ))}
      </div>

      <div className="cc-tmap-legend">
        {cells.slice(0, 6).map((cell) => (
          <span key={cell.symbol} className="cc-tmap-legend-item">
            <span className={cn("cc-tmap-legend-dot", stripTone(cell.symbol, cell.change24h))} />
            {cell.symbol} {cell.weightPct.toFixed(1)}%
          </span>
        ))}
      </div>

      <div className="cc-tmap-grid">
        {cells.map((cell) => (
          <WeightTile key={cell.symbol} cell={cell} />
        ))}
      </div>
    </section>
  );
}
