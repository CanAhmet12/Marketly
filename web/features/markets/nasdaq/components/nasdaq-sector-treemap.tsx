"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  buildNasdaqTreemapCells,
  nasdaqTreemapDominanceSummary,
} from "@/features/markets/nasdaq/lib/build-nasdaq-treemap";
import type { NasdaqScreenerAsset, NasdaqTreemapCell, NasdaqTreemapPayload } from "@/features/markets/nasdaq/types";
import { cn } from "@/lib/cn";

type Props = {
  screenerAssets: readonly NasdaqScreenerAsset[];
  treemap?: NasdaqTreemapPayload;
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function stripTone(symbol: string, change: number) {
  if (symbol === "NVDA" || symbol === "AAPL") return "nq-tmap-seg--mega";
  if (symbol === "MSFT" || symbol === "AMZN") return "nq-tmap-seg--large";
  if (change >= 0.3) return "cc-tmap-seg--up";
  if (change <= -0.3) return "cc-tmap-seg--down";
  return "cc-tmap-seg--neutral";
}

function tileTone(symbol: string, change: number) {
  if (symbol === "NVDA" || symbol === "AAPL") return "nq-tmap-tile--mega";
  if (symbol === "MSFT" || symbol === "AMZN") return "nq-tmap-tile--large";
  if (change >= 0.3) return "cc-tmap-tile--up";
  if (change <= -0.3) return "cc-tmap-tile--down";
  return "";
}

function WeightTile({ cell }: { cell: NasdaqTreemapCell }) {
  const isUp = cell.changePct >= 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(cell.symbol)}`}
      className={cn("cc-tmap-tile nq-tmap-tile", tileTone(cell.symbol, cell.changePct))}
      aria-label={`${cell.name} ${cell.weightPct.toFixed(1)}% ağırlık ${signed(cell.changePct)}`}
    >
      <div className="cc-tmap-tile-head">
        <span className="nq-tmap-symbol-badge">{cell.symbol.slice(0, 2)}</span>
        <span className="cc-tmap-tile-rank">#{cell.rank}</span>
      </div>
      <div className="cc-tmap-tile-body">
        <span className="cc-tmap-tile-symbol">{cell.symbol}</span>
        <span className="cc-tmap-tile-name">{cell.marketCap}</span>
      </div>
      <div className="cc-tmap-tile-foot">
        <span className={cn("cc-tmap-tile-change", isUp ? "cc-up" : "cc-down")}>{signed(cell.changePct)}</span>
        <span className="cc-tmap-tile-weight">{cell.weightPct.toFixed(1)}%</span>
      </div>
    </Link>
  );
}

export function NasdaqSectorTreemap({ screenerAssets, treemap }: Props) {
  const cells = useMemo(
    () => treemap?.cells ?? buildNasdaqTreemapCells(screenerAssets),
    [screenerAssets, treemap],
  );

  const { top3, top3Weight } = useMemo(() => nasdaqTreemapDominanceSummary(cells), [cells]);

  if (cells.length < 4) return null;

  return (
    <section className="cc-section cc-tmap nq-tmap" role="region" aria-label="NASDAQ piyasa değeri ağırlığı">
      <div className="cc-tmap-head">
        <div className="cc-zone-label cc-zone-label--flush">
          Piyasa değeri ağırlığı
          <Link href="/markets" className="cc-zone-label-link">
            Tüm hisseler →
          </Link>
        </div>
        <div className="cc-tmap-kpis">
          <div className="cc-tmap-kpi">
            <span className="cc-tmap-kpi-label">İlk 3 dominans</span>
            <span className="cc-tmap-kpi-value">{top3Weight.toFixed(1)}%</span>
          </div>
          {top3.map((cell) => (
            <div key={cell.symbol} className="cc-tmap-kpi cc-tmap-kpi--chip">
              <span className="nq-tmap-kpi-symbol">{cell.symbol}</span>
              <span className={cn("cc-tmap-kpi-change", cell.changePct >= 0 ? "cc-up" : "cc-down")}>
                {signed(cell.changePct)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="cc-tmap-strip" aria-hidden>
        {cells.map((cell) => (
          <span
            key={cell.symbol}
            className={cn("cc-tmap-seg", stripTone(cell.symbol, cell.changePct))}
            style={{ flexGrow: Math.max(0.5, cell.weightPct) }}
            title={`${cell.symbol} ${cell.weightPct.toFixed(1)}%`}
          />
        ))}
      </div>

      <div className="cc-tmap-legend">
        {cells.slice(0, 6).map((cell) => (
          <span key={cell.symbol} className="cc-tmap-legend-item">
            <span className={cn("cc-tmap-legend-dot", stripTone(cell.symbol, cell.changePct))} />
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
