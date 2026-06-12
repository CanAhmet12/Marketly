"use client";

import { cn } from "@/lib/cn";

type Props = {
  likesCount: number;
  copiesCount: number;
  liked: boolean;
  copied: boolean;
  canEngage: boolean;
  liking?: boolean;
  copying?: boolean;
  onLike: () => void;
  onCopy: () => void;
  compact?: boolean;
};

export function SignalEngagementActions({
  likesCount,
  copiesCount,
  liked,
  copied,
  canEngage,
  liking,
  copying,
  onLike,
  onCopy,
  compact,
}: Props) {
  return (
    <div className={cn("sig-eng-actions", compact && "sig-eng-actions--compact")}>
      <button
        type="button"
        className={cn("sig-eng-actions__btn", liked && "sig-eng-actions__btn--liked")}
        aria-pressed={liked}
        disabled={!canEngage || liking}
        title={canEngage ? (liked ? "Beğeniyi kaldır" : "Beğen") : "Giriş yapın"}
        onClick={(e) => {
          e.stopPropagation();
          onLike();
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} aria-hidden>
          <path
            d="M12 21s-6.7-4.35-9-8c-1.5-2.5-1-5.5 1.5-7 2.2-1.3 5-.6 7 1.5 2-2.1 4.8-2.8 7-1.5 2.5 1.5 3 4.5 1.5 7-2.3 3.65-9 8-9 8Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <span className="tabular-nums">{likesCount.toLocaleString("tr-TR")}</span>
      </button>
      <button
        type="button"
        className={cn("sig-eng-actions__btn", copied && "sig-eng-actions__btn--copied")}
        disabled={!canEngage || copied || copying}
        title={copied ? "Zaten kopyalandı" : canEngage ? "Sinyali kopyala" : "Giriş yapın"}
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <span className="tabular-nums">{copiesCount.toLocaleString("tr-TR")}</span>
      </button>
    </div>
  );
}
