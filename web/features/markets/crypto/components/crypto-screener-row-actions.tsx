"use client";

import Link from "next/link";

import { marketAssetSignalsPath } from "@/features/markets/markets-routes";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  watched: boolean;
  pending?: boolean;
  onToggleWatch: (symbol: string) => void;
};

export function CryptoScreenerRowActions({ symbol, watched, pending, onToggleWatch }: Props) {
  const signalsHref = marketAssetSignalsPath(symbol);

  return (
    <div className="cc-screener-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={cn(
          "cc-screener-btn cc-screener-btn--icon",
          watched && "cc-screener-btn--watch-active",
        )}
        aria-label={watched ? "Takipten çık" : "İzleme listesine ekle"}
        aria-pressed={watched}
        aria-busy={pending}
        disabled={pending}
        onClick={() => onToggleWatch(symbol)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={watched ? "currentColor" : "none"} aria-hidden>
          <path
            d="M12 21s-6.7-4.35-9-8c-1.5-2.5-1-5.5 1.5-7 2.2-1.3 5-.6 7 1.5 2-2.1 4.8-2.8 7-1.5 2.5 1.5 3 4.5 1.5 7-2.3 3.65-9 8-9 8Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <Link
        href={signalsHref}
        className="cc-screener-btn cc-screener-btn--pill cc-screener-btn--primary"
        aria-label={`${symbol} sinyalleri`}
      >
        Sinyal
      </Link>
    </div>
  );
}
