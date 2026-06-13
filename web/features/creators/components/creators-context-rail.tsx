"use client";

import Link from "next/link";

import { CreatorAnalystAvatar } from "@/features/creators/components/creator-analyst-avatar";
import { CREATOR_ASSET_PRESETS } from "@/features/creators/lib/creators-directory-config";
import {
  creatorPrimaryHref,
  getAnalystAccentTone,
  MARKET_LABELS,
} from "@/features/creators/lib/creator-analyst-meta";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type Props = {
  live: CreatorDirectoryRow[];
  topAccuracy: CreatorDirectoryRow[];
  rising: CreatorDirectoryRow[];
  onAssetPick: (asset: string) => void;
  activeAsset: string | null;
  className?: string;
};

function AccBar({ value }: { value: number }) {
  const tone = value >= 75 ? "high" : value >= 55 ? "mid" : "low";
  return (
    <span className="crt-canvas__ctx-acc" aria-hidden>
      <span className={cn("crt-canvas__ctx-acc-fill", `crt-canvas__ctx-acc-fill--${tone}`)} style={{ width: `${Math.min(100, value)}%` }} />
    </span>
  );
}

/** BÖLÜM 4 — bağlam paneli: canlı, isabet, yükselen, varlık */
export function CreatorsContextRail({
  live,
  topAccuracy,
  rising,
  onAssetPick,
  activeAsset,
  className,
}: Props) {
  const isMobile = className?.includes("crt-canvas__context-rail--mobile");

  return (
    <aside
      className={cn("crt-canvas__context-rail crt-canvas__context-zone", className)}
      aria-label="Analist bağlamı"
    >
      {!isMobile ? (
        <header className="crt-canvas__context-head">
          <div>
            <span className="crt-canvas__context-kicker">Context</span>
            <h2 className="crt-canvas__context-title">Bağlam paneli</h2>
          </div>
          {live.length > 0 ? (
            <span className="crt-canvas__context-live-pill">
              <span className="crt-canvas__context-live-dot" aria-hidden />
              {live.length} canlı
            </span>
          ) : null}
        </header>
      ) : null}

      {live.length > 0 ? (
        <section className="crt-canvas__ctx-panel crt-canvas__ctx-panel--live">
          <header className="crt-canvas__ctx-head">
            <span className="crt-canvas__ctx-dot crt-canvas__ctx-dot--pulse" aria-hidden />
            <div className="crt-canvas__ctx-head-copy">
              <span className="crt-canvas__ctx-kicker">Live</span>
              <h2 className="crt-canvas__ctx-title">Canlı masalar</h2>
            </div>
            <span className="crt-canvas__ctx-count tabular-nums">{live.length}</span>
          </header>
          <ul className="crt-canvas__ctx-list">
            {live.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link href={creatorPrimaryHref(c)} className="crt-canvas__ctx-row crt-canvas__ctx-row--live">
                  <CreatorAnalystAvatar creator={c} variant="context" className="crt-canvas__ctx-avatar" />
                  <span className="crt-canvas__ctx-copy min-w-0">
                    <span className="crt-canvas__ctx-name truncate">{c.displayName}</span>
                    <span className="crt-canvas__ctx-meta truncate">
                      {MARKET_LABELS[getAnalystAccentTone(c)]}
                      {c.activeSignalsCount > 0 ? ` · ${c.activeSignalsCount} sinyal` : ""}
                    </span>
                  </span>
                  <span className="crt-canvas__ctx-cta">İzle</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {topAccuracy.length > 0 ? (
        <section className="crt-canvas__ctx-panel crt-canvas__ctx-panel--accuracy">
          <header className="crt-canvas__ctx-head">
            <div className="crt-canvas__ctx-head-copy">
              <span className="crt-canvas__ctx-kicker">Track</span>
              <h2 className="crt-canvas__ctx-title">İsabet sıralaması</h2>
            </div>
          </header>
          <ul className="crt-canvas__ctx-list">
            {topAccuracy.slice(0, 5).map((c, i) => {
              const acc = Math.round(c.signalAccuracy ?? 0);
              return (
                <li key={c.id}>
                  <Link
                    href={c.channelHref}
                    className={cn(
                      "crt-canvas__ctx-row crt-canvas__ctx-row--ranked",
                      i < 3 && `crt-canvas__ctx-row--rank-${i + 1}`,
                    )}
                  >
                    <span className="crt-canvas__ctx-rank tabular-nums">{i + 1}</span>
                    <CreatorAnalystAvatar creator={c} variant="context" size={26} className="crt-canvas__ctx-avatar" />
                    <span className="crt-canvas__ctx-copy min-w-0 flex-1">
                      <span className="crt-canvas__ctx-name truncate">{c.displayName}</span>
                      <AccBar value={acc} />
                    </span>
                    <span className="crt-canvas__ctx-pct tabular-nums">%{acc}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {rising.length > 0 ? (
        <section className="crt-canvas__ctx-panel crt-canvas__ctx-panel--rising">
          <header className="crt-canvas__ctx-head">
            <div className="crt-canvas__ctx-head-copy">
              <span className="crt-canvas__ctx-kicker">Momentum</span>
              <h2 className="crt-canvas__ctx-title">Yükselen</h2>
            </div>
          </header>
          <ul className="crt-canvas__ctx-list">
            {rising.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link href={c.channelHref} className="crt-canvas__ctx-row">
                  <CreatorAnalystAvatar creator={c} variant="context" size={26} className="crt-canvas__ctx-avatar" />
                  <span className="crt-canvas__ctx-copy min-w-0">
                    <span className="crt-canvas__ctx-name truncate">{c.displayName}</span>
                    <span className="crt-canvas__ctx-meta truncate">{formatCompactCount(c.followerCount)} takipçi</span>
                  </span>
                  <span className="crt-canvas__ctx-rise" aria-hidden>
                    ↑
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="crt-canvas__ctx-panel crt-canvas__ctx-panel--assets">
        <header className="crt-canvas__ctx-head">
          <div className="crt-canvas__ctx-head-copy">
            <span className="crt-canvas__ctx-kicker">Focus</span>
            <h2 className="crt-canvas__ctx-title">Varlık odağı</h2>
          </div>
        </header>
        <div className="crt-canvas__ctx-assets">
          {CREATOR_ASSET_PRESETS.map((asset) => (
            <button
              key={asset}
              type="button"
              className={cn("crt-canvas__ctx-asset", activeAsset === asset && "crt-canvas__ctx-asset--active")}
              onClick={() => onAssetPick(asset)}
            >
              {asset}
            </button>
          ))}
        </div>
      </section>

      <footer className="crt-canvas__ctx-footer">
        <p className="crt-canvas__ctx-footer-kicker">Keşfet hub</p>
        <Link href="/discover" className="crt-canvas__ctx-footer-link">
          Tüm üreticiler →
        </Link>
      </footer>
    </aside>
  );
}
