"use client";

import Link from "next/link";

import type { CryptoMoverItem, CryptoMoversPayload } from "@/features/markets/crypto/types";
import { cn } from "@/lib/cn";

type Props = { movers: CryptoMoversPayload };

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)";
  if (v < 0) return "var(--cc-rose)";
  return "var(--cc-meta)";
}

function dotColor(v: number) {
  if (v > 3)  return "#2dd4bf";
  if (v > 0)  return "#5eead4";
  if (v < -3) return "#fb7185";
  if (v < 0)  return "#fca5a5";
  return "#64748b";
}

type ColProps = {
  title: string;
  rows: CryptoMoverItem[];
  valKey: "change" | "volume";
};

function MoverCol({ title, rows, valKey }: ColProps) {
  return (
    <div className="cc-movers-v2-col">
      <p className="cc-movers-v2-col-title">{title}</p>
      {rows.map((r, i) => (
        <Link
          key={r.symbol}
          href={`/markets/${encodeURIComponent(r.symbol)}`}
          className="cc-movers-v2-row"
          aria-label={`${r.symbol} detayı`}
        >
          <span className="cc-movers-v2-num">{i + 1}</span>
          <span
            className="cc-movers-v2-dot"
            style={{ background: dotColor(r.change) }}
            aria-hidden
          />
          <span className="cc-movers-v2-symbol">{r.symbol}</span>
          {valKey === "volume" && r.volume ? (
            <span className="cc-movers-v2-val" style={{ color: "var(--cc-text-secondary)" }}>
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

export function CryptoTopMovers({ movers }: Props) {
  return (
    <div className="cc-movers-v2 cc-section" role="region" aria-label="Piyasa hareketlileri">
      <div className="cc-movers-v2-header">Piyasa Hareketlileri</div>
      <div className="cc-movers-cols">
        <MoverCol title="En Çok Yükselenler" rows={movers.gainers}  valKey="change" />
        <MoverCol title="En Çok Düşenler"   rows={movers.losers}   valKey="change" />
        <MoverCol title="Hacim Liderleri"    rows={movers.volume}   valKey="volume" />
      </div>
    </div>
  );
}
