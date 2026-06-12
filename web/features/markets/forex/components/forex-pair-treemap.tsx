"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  buildForexTreemapCells,
  forexTreemapDominanceSummary,
} from "@/features/markets/forex/lib/build-forex-treemap";
import type { ForexScreenerAsset, ForexTreemapCell, ForexTreemapPayload } from "@/features/markets/forex/types";
import { cn } from "@/lib/cn";

type Props = {
  screenerAssets: readonly ForexScreenerAsset[];
  treemap?: ForexTreemapPayload;
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function stripTone(pair: string, change: number) {
  if (pair === "EUR/USD") return "fc-tmap-seg--eur";
  if (pair === "GBP/USD") return "fc-tmap-seg--gbp";
  if (pair === "USD/JPY") return "fc-tmap-seg--jpy";
  if (change >= 0.3) return "cc-tmap-seg--up";
  if (change <= -0.3) return "cc-tmap-seg--down";
  return "cc-tmap-seg--neutral";
}

function tileTone(pair: string, change: number) {
  if (pair === "EUR/USD") return "fc-tmap-tile--eur";
  if (pair === "GBP/USD") return "fc-tmap-tile--gbp";
  if (pair === "USD/JPY") return "fc-tmap-tile--jpy";
  if (change >= 0.3) return "cc-tmap-tile--up";
  if (change <= -0.3) return "cc-tmap-tile--down";
  return "";
}

function WeightTile({ cell }: { cell: ForexTreemapCell }) {
  const isUp = cell.changePct >= 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(cell.symbol)}`}
      className={cn("cc-tmap-tile fc-tmap-tile", tileTone(cell.pair, cell.changePct))}
      aria-label={`${cell.pair} ${cell.weightPct.toFixed(1)}% ağırlık ${signed(cell.changePct)}`}
    >
      <div className="cc-tmap-tile-head">
        <span className="fc-tmap-pair-badge">{cell.pair.split("/")[0]}</span>
        <span className="cc-tmap-tile-rank">#{cell.rank}</span>
      </div>
      <div className="cc-tmap-tile-body">
        <span className="cc-tmap-tile-symbol">{cell.pair}</span>
        <span className="cc-tmap-tile-name">Hacim {cell.volume}</span>
      </div>
      <div className="cc-tmap-tile-foot">
        <span className={cn("cc-tmap-tile-change", isUp ? "cc-up" : "cc-down")}>
          {signed(cell.changePct)}
        </span>
        <span className="cc-tmap-tile-weight">{cell.weightPct.toFixed(1)}%</span>
      </div>
    </Link>
  );
}

export function ForexPairTreemap({ screenerAssets, treemap }: Props) {
  const cells = useMemo(
    () => treemap?.cells ?? buildForexTreemapCells(screenerAssets),
    [screenerAssets, treemap],
  );

  const { top3, top3Weight } = useMemo(() => forexTreemapDominanceSummary(cells), [cells]);

  if (cells.length < 4) return null;

  return (
    <section className="cc-section cc-tmap fc-tmap" role="region" aria-label="Parite hacim ağırlığı">
      <div className="cc-tmap-head">
        <div className="cc-zone-label cc-zone-label--flush">
          Parite hacim ağırlığı
          <Link href="/markets" className="cc-zone-label-link">
            Tüm pariteler →
          </Link>
        </div>
        <div className="cc-tmap-kpis">
          <div className="cc-tmap-kpi">
            <span className="cc-tmap-kpi-label">İlk 3 dominans</span>
            <span className="cc-tmap-kpi-value">{top3Weight.toFixed(1)}%</span>
          </div>
          {top3.map((cell) => (
            <div key={cell.pair} className="cc-tmap-kpi cc-tmap-kpi--chip">
              <span className="fc-tmap-kpi-pair">{cell.pair}</span>
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
            key={cell.pair}
            className={cn("cc-tmap-seg", stripTone(cell.pair, cell.changePct))}
            style={{ flexGrow: Math.max(0.5, cell.weightPct) }}
            title={`${cell.pair} ${cell.weightPct.toFixed(1)}%`}
          />
        ))}
      </div>

      <div className="cc-tmap-legend">
        {cells.slice(0, 6).map((cell) => (
          <span key={cell.pair} className="cc-tmap-legend-item">
            <span className={cn("cc-tmap-legend-dot", stripTone(cell.pair, cell.changePct))} />
            {cell.pair} {cell.weightPct.toFixed(1)}%
          </span>
        ))}
      </div>

      <div className="cc-tmap-grid">
        {cells.map((cell) => (
          <WeightTile key={cell.pair} cell={cell} />
        ))}
      </div>
    </section>
  );
}
