"use client";

import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  isLive?: boolean;
};

/** Sayfa üstü canlı akış şeridi (scan + pulse) */
export function CryptoDetailLiveBeam({ symbol, isLive = true }: Props) {
  return (
    <div
      className={cn("cd-live-beam", isLive && "cd-live-beam--active")}
      role="status"
      aria-live="polite"
      aria-label={isLive ? `${symbol} canlı piyasa akışı` : `${symbol} piyasa özeti`}
    >
      <div className="cd-live-beam-track" aria-hidden>
        <span className="cd-live-beam-line" />
        <span className="cd-live-beam-scan" />
        <span className="cd-live-beam-glow" />
      </div>

      <div className="cd-live-beam-meta">
        <span className="cd-live-beam-dot" aria-hidden />
        <span className="cd-live-beam-label">{isLive ? "CANLI" : "GECİKMELİ"}</span>
        <span className="cd-live-beam-sep" aria-hidden>
          ·
        </span>
        <span className="cd-live-beam-symbol">{symbol}</span>
        <span className="cd-live-beam-caption">7/24 piyasa akışı</span>
      </div>
    </div>
  );
}
