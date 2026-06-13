"use client";

import Link from "next/link";

import { CreatorAnalystAvatar } from "@/features/creators/components/creator-analyst-avatar";
import { SignalConfBar } from "@/features/discover/visual-reference/discover-signal-tile";
import {
  creatorProfileHref,
  getAnalystAccentTone,
  MARKET_LABELS,
} from "@/features/creators/lib/creator-analyst-meta";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { cn } from "@/lib/cn";

type Props = {
  leaders: CreatorDirectoryRow[];
};

/** Hero bento sağ panel — isabet liderleri mini sıralama */
export function CreatorsAccuracyLeaderboard({ leaders }: Props) {
  if (leaders.length === 0) return null;

  return (
    <aside className="crt-canvas__leaderboard" aria-label="İsabet liderleri">
      <div className="crt-canvas__leaderboard-head">
        <span className="crt-canvas__leaderboard-kicker">İsabet</span>
        <h2 className="crt-canvas__leaderboard-title">Liderler</h2>
      </div>

      <ol className="crt-canvas__leaderboard-list">
        {leaders.map((creator, i) => {
          const tone = getAnalystAccentTone(creator);
          const profileHref = creatorProfileHref(creator);

          return (
            <li key={creator.id}>
              <Link href={profileHref} className={cn("crt-canvas__leaderboard-row", `crt-canvas__leaderboard-row--tone-${tone}`)}>
                <span className="crt-canvas__leaderboard-rank tabular-nums" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <CreatorAnalystAvatar
                  creator={creator}
                  variant="leaderboard"
                  className="crt-canvas__leaderboard-avatar"
                />
                <span className="crt-canvas__leaderboard-info min-w-0">
                  <span className="crt-canvas__leaderboard-name truncate">{creator.displayName}</span>
                  <span className="crt-canvas__leaderboard-meta truncate">
                    {MARKET_LABELS[tone]}
                    {creator.bestSignalSymbol ? ` · ${creator.bestSignalSymbol}` : ""}
                  </span>
                </span>
                {creator.signalAccuracy != null && creator.signalAccuracy > 0 ? (
                  <span className="crt-canvas__leaderboard-acc shrink-0">
                    <SignalConfBar value={Math.round(creator.signalAccuracy)} size="sm" />
                    <span className="crt-canvas__leaderboard-pct tabular-nums">
                      %{Math.round(creator.signalAccuracy)}
                    </span>
                  </span>
                ) : (
                  <span className="crt-canvas__leaderboard-acc crt-canvas__leaderboard-acc--empty">—</span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
