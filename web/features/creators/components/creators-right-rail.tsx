"use client";

import Link from "next/link";

import { CREATOR_ASSET_PRESETS } from "@/features/creators/lib/creators-directory-config";
import {
  creatorPrimaryHref,
  getAnalystAccentTone,
  MARKET_LABELS,
} from "@/features/creators/lib/creator-analyst-meta";
import {
  avatarColorFromCreatorId,
  initialsFromDisplayName,
} from "@/features/creators/lib/map-creator-to-vr";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type Props = {
  live: CreatorDirectoryRow[];
  topAccuracy: CreatorDirectoryRow[];
  rising: CreatorDirectoryRow[];
  totalCount: number;
  liveCount: number;
  onAssetPick: (asset: string) => void;
  activeAsset: string | null;
};

function RailMonogram({ creator, size = 32 }: { creator: CreatorDirectoryRow; size?: number }) {
  const initial = initialsFromDisplayName(creator.displayName);
  const color = avatarColorFromCreatorId(creator.id);
  return (
    <span
      className="crt-v2-rail__mono"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${color}ee, ${color}88)`,
      }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function AccuracyBar({ value }: { value: number }) {
  const tone = value >= 75 ? "high" : value >= 55 ? "mid" : "low";
  return (
    <span className="crt-v2-rail__acc-bar" aria-hidden>
      <span
        className={cn("crt-v2-rail__acc-fill", `crt-v2-rail__acc-fill--${tone}`)}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </span>
  );
}

export function CreatorsRightRail({
  live,
  topAccuracy,
  rising,
  totalCount,
  liveCount,
  onAssetPick,
  activeAsset,
}: Props) {
  const topAcc = topAccuracy[0]?.signalAccuracy ?? null;

  return (
    <aside className="crt-v2-rail" aria-label="Analist paneli">
      <div className="crt-v2-rail__stat-grid">
        <div className="crt-v2-rail__stat crt-v2-rail__stat--total">
          <span className="crt-v2-rail__stat-val tabular-nums">{totalCount}</span>
          <span className="crt-v2-rail__stat-lab">Analist</span>
        </div>
        <div className={cn("crt-v2-rail__stat", liveCount > 0 && "crt-v2-rail__stat--live")}>
          <span className="crt-v2-rail__stat-val tabular-nums">{liveCount}</span>
          <span className="crt-v2-rail__stat-lab">Canlı</span>
        </div>
        <div className="crt-v2-rail__stat crt-v2-rail__stat--acc">
          <span className="crt-v2-rail__stat-val tabular-nums">
            {topAcc != null ? `%${Math.round(topAcc)}` : "—"}
          </span>
          <span className="crt-v2-rail__stat-lab">En iyi isabet</span>
        </div>
      </div>

      {live.length > 0 ? (
        <section className="crt-v2-rail__panel crt-v2-rail__panel--live">
          <header className="crt-v2-rail__panel-head">
            <span className="crt-v2-rail__panel-dot" aria-hidden />
            <h2 className="crt-v2-rail__panel-title">Canlı masalar</h2>
          </header>
          <ul className="crt-v2-rail__rows m-0 list-none p-0">
            {live.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link href={creatorPrimaryHref(c)} className="crt-v2-rail__row crt-v2-rail__row--live">
                  <RailMonogram creator={c} />
                  <span className="crt-v2-rail__row-copy min-w-0">
                    <span className="crt-v2-rail__row-name truncate">{c.displayName}</span>
                    <span className="crt-v2-rail__row-meta truncate">
                      {MARKET_LABELS[getAnalystAccentTone(c)]}
                      {c.activeSignalsCount > 0 ? ` · ${c.activeSignalsCount} sinyal` : ""}
                      {` · ${formatCompactCount(c.followerCount)}`}
                    </span>
                  </span>
                  <span className="crt-v2-rail__row-cta">İzle</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {topAccuracy.length > 0 ? (
        <section className="crt-v2-rail__panel crt-v2-rail__panel--acc">
          <header className="crt-v2-rail__panel-head">
            <h2 className="crt-v2-rail__panel-title">İsabet sıralaması</h2>
          </header>
          <ul className="crt-v2-rail__rows m-0 list-none p-0">
            {topAccuracy.slice(0, 5).map((c, i) => {
              const acc = Math.round(c.signalAccuracy ?? 0);
              return (
                <li key={c.id}>
                  <Link href={c.channelHref} className="crt-v2-rail__row crt-v2-rail__row--rank">
                    <span className="crt-v2-rail__rank tabular-nums">{i + 1}</span>
                    <RailMonogram creator={c} size={28} />
                    <span className="crt-v2-rail__row-copy min-w-0 flex-1">
                      <span className="crt-v2-rail__row-name truncate">{c.displayName}</span>
                      <AccuracyBar value={acc} />
                    </span>
                    <span className="crt-v2-rail__acc-pct tabular-nums">%{acc}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {rising.length > 0 ? (
        <section className="crt-v2-rail__panel">
          <header className="crt-v2-rail__panel-head">
            <h2 className="crt-v2-rail__panel-title">Yükselen</h2>
          </header>
          <ul className="crt-v2-rail__rows m-0 list-none p-0">
            {rising.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link href={c.channelHref} className="crt-v2-rail__row">
                  <RailMonogram creator={c} size={28} />
                  <span className="crt-v2-rail__row-copy min-w-0">
                    <span className="crt-v2-rail__row-name truncate">{c.displayName}</span>
                    <span className="crt-v2-rail__row-meta truncate">{c.handle}</span>
                  </span>
                  <span className="crt-v2-rail__rise-badge" aria-hidden>
                    ↑
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="crt-v2-rail__panel crt-v2-rail__panel--assets">
        <header className="crt-v2-rail__panel-head">
          <h2 className="crt-v2-rail__panel-title">Varlık</h2>
        </header>
        <div className="crt-v2-rail__asset-grid">
          {CREATOR_ASSET_PRESETS.map((asset) => (
            <button
              key={asset}
              type="button"
              className={cn("crt-v2-rail__asset", activeAsset === asset && "crt-v2-rail__asset--active")}
              onClick={() => onAssetPick(asset)}
            >
              {asset}
            </button>
          ))}
        </div>
      </section>

      <div className="crt-v2-rail__spacer" aria-hidden />

      <footer className="crt-v2-rail__footer">
        <p className="crt-v2-rail__footer-kicker">Keşfet</p>
        <p className="crt-v2-rail__footer-title">Yeni analistleri keşfet ve canlı masalara katıl</p>
        <Link href="/discover?tab=creators" className="crt-v2-rail__footer-link">
          Hub&apos;da gör
          <span aria-hidden>→</span>
        </Link>
      </footer>
    </aside>
  );
}
