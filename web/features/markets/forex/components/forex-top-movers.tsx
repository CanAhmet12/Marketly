"use client";

import type { ForexMoverItem, ForexMoversPayload } from "@/features/markets/forex/types";

type Props = { movers: ForexMoversPayload };

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }
function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)";
  if (v < 0) return "var(--cc-rose)";
  return "var(--cc-meta)";
}
function dotColor(v: number) {
  if (v > 0.3)  return "#8b5cf6";
  if (v > 0)    return "rgba(139,92,246,0.5)";
  if (v < -0.3) return "#ef4444";
  if (v < 0)    return "rgba(239,68,68,0.5)";
  return "#64748b";
}

type ColProps = { title: string; rows: ForexMoverItem[]; showVolume?: boolean };

function MoverCol({ title, rows, showVolume = false }: ColProps) {
  return (
    <div className="cc-movers-v2-col">
      <p className="cc-movers-v2-col-title">{title}</p>
      {rows.map((r, i) => (
        <div key={r.pair} className="cc-movers-v2-row" style={{ cursor: "default" }}>
          <span className="cc-movers-v2-num">{i + 1}</span>
          <span className="cc-movers-v2-dot" style={{ background: dotColor(r.changePct) }} aria-hidden />
          <span className="cc-movers-v2-symbol" style={{ fontSize: 11 }}>{r.pair}</span>
          {showVolume && r.volume ? (
            <span className="cc-movers-v2-val" style={{ color: "var(--cc-text-secondary)", fontSize: 11 }}>
              {r.volume}
            </span>
          ) : (
            <span className="cc-movers-v2-val" style={{ color: changeColor(r.changePct) }}>
              {signed(r.changePct)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function ForexTopMovers({ movers }: Props) {
  return (
    <div className="cc-movers-v2 cc-section" role="region" aria-label="Parite hareketlileri">
      <div className="cc-movers-v2-header">Parite Hareketlileri</div>
      <div className="cc-movers-cols">
        <MoverCol title="Yukselenler"  rows={movers.gainers} />
        <MoverCol title="Dusenler"     rows={movers.losers} />
        <MoverCol title="En Aktif"     rows={movers.active} showVolume />
      </div>
    </div>
  );
}
