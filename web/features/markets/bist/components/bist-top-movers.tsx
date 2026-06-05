"use client";

import Link from "next/link";

import type { BistMoverItem, BistMoversPayload } from "@/features/markets/bist/types";

type Props = { movers: BistMoversPayload };

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)";
  if (v < 0) return "var(--cc-rose)";
  return "var(--cc-meta)";
}

function dotColor(v: number) {
  if (v > 3)  return "#22c55e";
  if (v > 0)  return "#86efac";
  if (v < -3) return "#ef4444";
  if (v < 0)  return "#fca5a5";
  return "#64748b";
}

type ColProps = {
  title: string;
  rows: BistMoverItem[];
  showVolume?: boolean;
};

function MoverCol({ title, rows, showVolume = false }: ColProps) {
  return (
    <div className="cc-movers-v2-col">
      <p className="cc-movers-v2-col-title">{title}</p>
      {rows.map((r, i) => (
        <Link
          key={r.symbol}
          href={`/markets/${encodeURIComponent(r.symbol)}`}
          className="cc-movers-v2-row"
          aria-label={`${r.symbol} detayi`}
        >
          <span className="cc-movers-v2-num">{i + 1}</span>
          <span className="cc-movers-v2-dot" style={{ background: dotColor(r.change) }} aria-hidden />
          <span className="cc-movers-v2-symbol">{r.symbol}</span>
          {showVolume && r.volume ? (
            <span className="cc-movers-v2-val" style={{ color: "var(--cc-text-secondary)", fontSize: 11 }}>
              {r.volume}
            </span>
          ) : (
            <span className="cc-movers-v2-val" style={{ color: changeColor(r.change) }}>
              {signed(r.change)}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

export function BistTopMovers({ movers }: Props) {
  return (
    <div className="cc-movers-v2 cc-section" role="region" aria-label="Piyasa hareketlileri">
      <div className="cc-movers-v2-header">Piyasa Hareketlileri</div>
      <div className="cc-movers-cols">
        <MoverCol title="En Cok Yukselenler" rows={movers.gainers} />
        <MoverCol title="En Cok Dusenler"    rows={movers.losers} />
        <MoverCol title="Hacim Liderleri"     rows={movers.volume} showVolume />
      </div>
    </div>
  );
}
