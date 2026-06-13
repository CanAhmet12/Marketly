"use client";

import { SignalConfBar } from "@/features/discover/visual-reference/discover-signal-tile";
import { signalMarketTone } from "@/features/signals/lib/signal-market-tone";
import { resolveSignalAssetCategory } from "@/features/signals/lib/resolve-signal-asset-category";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { cn } from "@/lib/cn";

type Props = {
  leaders: SignalsFeedRow[];
  onOpen: (row: SignalsFeedRow) => void;
};

/** Hero bento sağ panel — güven liderleri mini sıralama */
export function SignalsConfidenceLeaderboard({ leaders, onOpen }: Props) {
  if (leaders.length === 0) return null;

  return (
    <aside className="sig-canvas__leaderboard" aria-label="Güven liderleri">
      <div className="sig-canvas__leaderboard-head">
        <span className="sig-canvas__leaderboard-kicker">Güven</span>
        <h2 className="sig-canvas__leaderboard-title">Liderler</h2>
      </div>

      <ol className="sig-canvas__leaderboard-list">
        {leaders.map((row, i) => {
          const tone = signalMarketTone(resolveSignalAssetCategory(row));

          return (
            <li key={row.id}>
              <button
                type="button"
                className={cn("sig-canvas__leaderboard-row", `sig-canvas__leaderboard-row--tone-${tone}`)}
                onClick={() => onOpen(row)}
              >
                <span className="sig-canvas__leaderboard-rank tabular-nums" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="sig-canvas__leaderboard-symbol tabular-nums">{row.symbol}</span>
                <span className="sig-canvas__leaderboard-info min-w-0">
                  <span className="sig-canvas__leaderboard-name truncate">{row.analyst.display}</span>
                  <span className="sig-canvas__leaderboard-meta truncate">{row.timeframe}</span>
                </span>
                <span className="sig-canvas__leaderboard-acc shrink-0">
                  <SignalConfBar value={row.confidence} size="sm" />
                  <span className="sig-canvas__leaderboard-pct tabular-nums">%{row.confidence}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
