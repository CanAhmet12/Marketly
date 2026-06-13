"use client";

import Link from "next/link";

import type { NasdaqMoverItem, NasdaqMoversPayload } from "@/features/markets/nasdaq/types";
import { cn } from "@/lib/cn";

type Props = { movers: NasdaqMoversPayload };

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function dotColor(v: number) {
  if (v > 0.3) return "var(--cc-gold)";
  if (v > 0) return "color-mix(in srgb, var(--cc-gold) 55%, transparent)";
  if (v < -0.3) return "var(--cc-rose)";
  if (v < 0) return "color-mix(in srgb, var(--cc-rose) 55%, transparent)";
  return "var(--cc-meta)";
}

function changeClass(v: number) {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "cc-neutral";
}

function MoverCol({
  title,
  rows,
  showVolume = false,
}: {
  title: string;
  rows: readonly NasdaqMoverItem[];
  showVolume?: boolean;
}) {
  return (
    <div className="cc-movers-v2-col">
      <p className="cc-movers-v2-col-title">{title}</p>
      {rows.map((r, i) => (
        <Link
          key={r.symbol}
          href={`/markets/${encodeURIComponent(r.symbol)}`}
          className="cc-movers-v2-row"
        >
          <span className="cc-movers-v2-num">{i + 1}</span>
          <span className="cc-movers-v2-dot" style={{ background: dotColor(r.changePct) }} aria-hidden />
          <span className="cc-movers-v2-symbol">{r.symbol}</span>
          {showVolume && r.volume ? (
            <span className="cc-movers-v2-val cc-intel-row-val--muted">{r.volume}</span>
          ) : (
            <span className={cn("cc-movers-v2-val", changeClass(r.changePct))}>{signed(r.changePct)}</span>
          )}
        </Link>
      ))}
    </div>
  );
}

export function NasdaqTopMovers({ movers }: Props) {
  return (
    <div className="cc-movers-v2 cc-section" role="region" aria-label="NASDAQ hareketlileri">
      <div className="cc-movers-v2-header">NASDAQ Hareketlileri</div>
      <div className="cc-movers-cols">
        <MoverCol title="Yükselenler" rows={movers.gainers} />
        <MoverCol title="Düşenler" rows={movers.losers} />
        <MoverCol title="Hacim liderleri" rows={movers.volume} showVolume />
      </div>
    </div>
  );
}
