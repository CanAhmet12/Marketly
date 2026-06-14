"use client";

import Link from "next/link";

import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import type { CryptoMoverItem, CryptoMoversPayload } from "@/features/markets/crypto/types";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import { cn } from "@/lib/cn";

type Props = { movers: CryptoMoversPayload };

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function dotColor(v: number) {
  if (v > 3) return "#2dd4bf";
  if (v > 0) return "#5eead4";
  if (v < -3) return "#fb7185";
  if (v < 0) return "#fca5a5";
  return "#64748b";
}

function changeClass(v: number) {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "cc-neutral";
}

type ColProps = {
  title: string;
  rows: CryptoMoverItem[];
  mode: "change" | "volume" | "volatile";
};

function MoverCol({ title, rows, mode }: ColProps) {
  return (
    <div className="cc-movers-v2-col">
      <p className="cc-movers-v2-col-title">{title}</p>
      {rows.map((r, i) => (
        <Link
          key={r.symbol}
          href={marketSymbolPath(r.symbol)}
          className="cc-movers-v2-row"
          aria-label={`${r.symbol} sinyalleri`}
        >
          <span className="cc-movers-v2-num">{i + 1}</span>
          <MarketSymbolIcon symbol={r.symbol} size={22} className="cc-movers-v2-icon" />
          <span
            className="cc-movers-v2-dot"
            style={{ background: dotColor(r.change) }}
            aria-hidden
          />
          <span className="cc-movers-v2-symbol">{r.symbol}</span>
          {mode === "volume" && r.volume ? (
            <span className="cc-movers-v2-val cc-movers-v2-val--muted">{r.volume}</span>
          ) : mode === "volatile" && r.volatility ? (
            <span className="cc-movers-v2-val cc-movers-v2-val--volatile">{r.volatility}</span>
          ) : (
            <span className={cn("cc-movers-v2-val", changeClass(r.change))}>{signed(r.change)}</span>
          )}
        </Link>
      ))}
    </div>
  );
}

export function CryptoTopMovers({ movers }: Props) {
  const cols = [
    { title: "En Çok Yükselenler", rows: movers.gainers, mode: "change" as const },
    { title: "En Çok Düşenler", rows: movers.losers, mode: "change" as const },
    { title: "Hacim Liderleri", rows: movers.volume, mode: "volume" as const },
    { title: "En Volatil", rows: movers.volatile, mode: "volatile" as const },
  ].filter((col) => col.rows.length > 0);

  return (
    <div className="cc-movers-v2 cc-section" role="region" aria-label="Piyasa hareketlileri">
      <div className="cc-movers-v2-header">Piyasa Hareketlileri</div>
      <div className={cn("cc-movers-cols", cols.length === 4 && "cc-movers-cols--quad")}>
        {cols.map((col) => (
          <MoverCol key={col.title} title={col.title} rows={col.rows} mode={col.mode} />
        ))}
      </div>
    </div>
  );
}
