"use client";

import { useMemo } from "react";

import { useCryptoDetailStats } from "@/features/markets/crypto/detail/hooks/use-crypto-detail-stats";
import type { CryptoDetailStatCell, CryptoDetailStatTone } from "@/features/markets/crypto/detail/lib/crypto-detail-stats-types";
import type { AssetSignalSummary } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

const KEY_STAT_KEYS = new Set(["mcap", "vol", "chg", "ath-dist", "volatility", "signals"]);

type Props = {
  asset: MarketAssetView;
  allAssets: readonly MarketAssetView[];
  signalSummary?: AssetSignalSummary;
  unified?: boolean;
};

function toneClass(tone?: CryptoDetailStatTone): string | undefined {
  if (tone === "up") return "cc-up";
  if (tone === "down") return "cc-down";
  if (tone === "gold") return "cd-stat-value--gold";
  if (tone === "accent") return "cd-stat-value--accent";
  if (tone === "muted") return "cd-stat-value--muted";
  return undefined;
}

function StatTile({ cell, loading }: { cell: CryptoDetailStatCell; loading?: boolean }) {
  return (
    <div
      className={cn("cd-stats-tmap-tile", loading && "cd-stats-tmap-tile--loading")}
      title={cell.hint ? `${cell.label} · ${cell.hint}` : cell.label}
    >
      <span className="cd-stats-tmap-tile-label">{cell.label}</span>
      <span className={cn("cd-stats-tmap-tile-value", toneClass(cell.tone))}>{cell.value}</span>
      {cell.hint ? <span className="cd-stats-tmap-tile-hint">{cell.hint}</span> : null}
    </div>
  );
}

export function CryptoDetailStatsMatrix({ asset, allAssets, signalSummary, unified = false }: Props) {
  const { payload, isLoading } = useCryptoDetailStats({ asset, allAssets, signalSummary });

  const { keyCells, detailCells } = useMemo(() => {
    const key = payload.cells.filter((c) => KEY_STAT_KEYS.has(c.key));
    const detail = payload.cells.filter((c) => !KEY_STAT_KEYS.has(c.key));
    return { keyCells: key.length > 0 ? key : payload.cells.slice(0, 6), detailCells: detail };
  }, [payload.cells]);

  if (!payload.cells.length) return null;

  if (unified) {
    return (
      <section className="cd-stats-tmap" role="region" aria-label="Teknik bilgiler">
        <div className="cd-stats-tmap-grid">
          {payload.cells.map((cell) => (
            <StatTile key={cell.key} cell={cell} loading={isLoading} />
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="cd-stats-v3" role="region" aria-label="Temel istatistikler">
      <div className="cd-key-stats" role="list">
        {keyCells.map((cell) => (
          <div
            key={cell.key}
            role="listitem"
            className={cn("cd-key-stat", isLoading && "cd-key-stat--loading")}
            title={cell.hint}
          >
            <span className="cd-key-stat-label">{cell.label}</span>
            <span className={cn("cd-key-stat-value", toneClass(cell.tone))}>{cell.value}</span>
          </div>
        ))}
      </div>

      {detailCells.length > 0 ? (
        <div className="cd-stats-grid cd-stats-grid--detail" role="list">
          {detailCells.map((cell) => (
            <div
              key={cell.key}
              role="listitem"
              className={cn("cd-stat-cell", cell.wide && "cd-stat-cell--wide", isLoading && "cd-stat-cell--loading")}
            >
              <span className="cd-stat-label">{cell.label}</span>
              <span className={cn("cd-stat-value", toneClass(cell.tone))}>{cell.value}</span>
              {cell.hint ? <span className="cd-stat-hint">{cell.hint}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
