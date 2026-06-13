"use client";

import Link from "next/link";

import type { BistMoverItem, BistMoversPayload } from "@/features/markets/bist/types";
import { cn } from "@/lib/cn";

type Props = { movers: BistMoversPayload };

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

function FlowCol({
  title,
  rows,
  mode,
}: {
  title: string;
  rows: readonly BistMoverItem[];
  mode: "change" | "volume" | "volatile";
}) {
  return (
    <div className="cc-intel-col bc-intel-col">
      <p className="cc-intel-col-title">{title}</p>
      <ul className="cc-intel-col-list">
        {rows.length === 0 ? (
          <li className="cc-intel-col-empty">—</li>
        ) : (
          rows.slice(0, 5).map((row, index) => (
            <li key={`${title}-${row.symbol}`}>
              <Link href={`/markets/${encodeURIComponent(row.symbol)}`} className="cc-intel-row bc-intel-row">
                <span className="cc-intel-row-num">{index + 1}</span>
                <span className="bc-intel-symbol-badge">{row.symbol.slice(0, 2)}</span>
                <span className="cc-intel-row-dot" style={{ background: dotColor(row.change) }} aria-hidden />
                <span className="cc-intel-row-symbol">{row.symbol}</span>
                {mode === "volume" && row.volume ? (
                  <span className="cc-intel-row-val cc-intel-row-val--muted">{row.volume}</span>
                ) : mode === "volatile" && row.volatility ? (
                  <span className="cc-intel-row-val cc-intel-row-val--violet">{row.volatility}</span>
                ) : (
                  <span className={cn("cc-intel-row-val", changeClass(row.change))}>{signed(row.change)}</span>
                )}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function BistIntelDeck({ movers }: Props) {
  const cols = [
    { title: "Yükselenler", rows: movers.gainers, mode: "change" as const },
    { title: "Düşenler", rows: movers.losers, mode: "change" as const },
    { title: "Hacim liderleri", rows: movers.volume, mode: "volume" as const },
    { title: "En volatil", rows: movers.volatile ?? [], mode: "volatile" as const },
  ].filter((col) => col.rows.length > 0);

  if (!cols.length) return null;

  return (
    <section className="cc-section cc-intel-board bc-intel-board" role="region" aria-label="BIST piyasa istihbaratı">
      <div className="cc-zone-label cc-zone-label--flush">
        Piyasa istihbaratı
        <span className="cc-intel-board-sub">BIST akış özeti</span>
      </div>

      <div className={cn("cc-intel-board-grid", cols.length === 4 && "cc-intel-board-grid--quad")}>
        {cols.map((col) => (
          <FlowCol key={col.title} title={col.title} rows={col.rows} mode={col.mode} />
        ))}
      </div>
    </section>
  );
}
