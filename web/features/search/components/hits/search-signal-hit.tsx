"use client";

import Link from "next/link";

import type { SearchSignalHit } from "@/features/search/types";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

type Props = { signal: SearchSignalHit };

function parseDirection(raw: string): "BUY" | "SELL" | "HOLD" {
  const x = raw.toUpperCase();
  if (x === "BUY" || x === "LONG") return "BUY";
  if (x === "SELL" || x === "SHORT") return "SELL";
  return "HOLD";
}

function dirLabel(dir: "BUY" | "SELL" | "HOLD"): string {
  if (dir === "BUY") return "AL";
  if (dir === "SELL") return "SAT";
  return "BEKLE";
}

export function SearchSignalHit({ signal }: Props) {
  const dir = parseDirection(signal.direction);
  const pct = Math.max(0, Math.min(100, Math.round(signal.confidence)));
  const href = `/signals?asset=${encodeURIComponent(signal.symbol)}`;

  return (
    <Link
      href={href}
      className={cn("srch-hit srch-hit--signal", `srch-hit--signal-${dir.toLowerCase()}`)}
    >
      <div className="srch-hit__row">
        <span className="srch-hit__dir">{dirLabel(dir)}</span>
        <span className="srch-hit__symbol">{signal.symbol}</span>
        <span className="srch-hit__tf">{signal.timeframe || "1G"}</span>
      </div>
      <div className="srch-hit__conviction">
        <div className="srch-hit__conviction-track">
          <div className="srch-hit__conviction-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="srch-hit__conviction-val">%{pct}</span>
      </div>
      {signal.rationale ? <p className="srch-hit__rationale">{signal.rationale}</p> : null}
      <div className="srch-hit__meta">
        <span>{signal.creator_name}</span>
        <span>·</span>
        <span>{formatTimeAgo(signal.created_at)}</span>
      </div>
    </Link>
  );
}
