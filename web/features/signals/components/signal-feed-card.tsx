"use client";

import Link from "next/link";
import { memo, useMemo, type MouseEvent } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { SignalConfidenceRing } from "@/features/signals/components/signal-confidence-ring";
import {
  SignalDirectionPill,
  formatSignalPrice,
  strategyTacticLabel,
} from "@/features/signals/components/unified-signal-primitives";
import { buildSignalClipboardText } from "@/features/signals/domain/signal-meta";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { signalRowLocked } from "@/features/signals/components/signal-economy-ui";
import { useMockSignalSubscriber } from "@/features/signals/hooks/use-mock-signal-subscriber";
import { trackSignalCopy } from "@/features/personalization/tracking";
import { cn } from "@/lib/cn";

type Props = {
  row: SignalsFeedRow;
  saved: boolean;
  onToggleSave: () => void;
  onOpenDetail: () => void;
  onShare: () => void;
};

export const SignalFeedCard = memo(function SignalFeedCard({ row, saved, onToggleSave, onOpenDetail, onShare }: Props) {
  const trend: "up" | "down" | "flat" =
    row.direction === "BUY" ? "up" : row.direction === "SELL" ? "down" : "flat";
  const isSubscriber = useMockSignalSubscriber();
  const locked = signalRowLocked(row, isSubscriber);

  const copyToClipboard = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    void navigator.clipboard?.writeText(buildSignalClipboardText(row));
    trackSignalCopy(row.id, row.symbol, row.analyst.id);
  };

  const entry = row.entryZoneLabel ?? formatSignalPrice(row.entry_price);
  const target = formatSignalPrice(row.target_price);
  const stop = formatSignalPrice(row.stop_loss);
  const rr = row.riskRewardLabel ?? (row.risk_reward_ratio != null ? `${row.risk_reward_ratio.toFixed(1)}x` : null);

  const timeAgo = useMemo(() => {
    const ms = Date.now() - new Date(row.created_at).getTime();
    const mins = Math.floor(ms / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours} saat önce`;
    if (mins > 0) return `${mins} dk önce`;
    return "Az önce";
  }, [row.created_at]);

  const dirClass =
    row.direction === "BUY" ? "sp-card--buy" : row.direction === "SELL" ? "sp-card--sell" : "sp-card--hold";

  const previewClass =
    row.performance_preview_pct != null && !locked
      ? row.performance_preview_pct >= 0
        ? "sp-card-tag--rise"
        : "sp-card-tag--fall"
      : null;

  return (
    <article
      className={cn("sp-card", dirClass)}
      role="button"
      tabIndex={0}
      aria-label={`${row.symbol} ${row.direction} sinyali — detay`}
      onClick={onOpenDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail();
        }
      }}
    >
      <div className="sp-card-header">
        <div className="sp-card-ring-wrap">
          <SignalConfidenceRing value={row.confidence} direction={row.direction} size={48} />
        </div>

        <div className="sp-card-title-area">
          <div className="sp-card-symbol-row">
            <span className="sp-card-symbol">{row.symbol}</span>
            <SignalDirectionPill direction={row.direction} />
          </div>
          <div className="sp-card-tags-row">
            <span className="sp-card-tag">{strategyTacticLabel(row.strategy)}</span>
            <span className="sp-card-tag">{row.timeframe}</span>
            {previewClass ? (
              <span className={cn("sp-card-tag", previewClass)}>
                {row.performance_preview_pct! >= 0 ? "+" : ""}
                {row.performance_preview_pct}%
              </span>
            ) : null}
            {row.signal_access !== "public" ? <span className="sp-card-tag sp-card-tag--premium">★ Premium</span> : null}
          </div>
          <div className="sp-card-time">{timeAgo}</div>
        </div>

        <div className="sp-card-sparkline-wrap">
          <MiniSparkline series={row.sparkline} trend={trend} height={44} className="w-full" />
        </div>
      </div>

      {!locked ? (
        <div className="sp-card-levels">
          <div className="sp-card-level">
            <span className="sp-card-level-label">Giriş</span>
            <span className="sp-card-level-value">{entry}</span>
          </div>
          <div className="sp-card-level">
            <span className="sp-card-level-label">Hedef</span>
            <span className="sp-card-level-value sp-card-level-value--target">{target}</span>
          </div>
          <div className="sp-card-level">
            <span className="sp-card-level-label">Stop</span>
            <span className="sp-card-level-value sp-card-level-value--stop">{stop}</span>
          </div>
          <div className="sp-card-level">
            <span className="sp-card-level-label">R/R</span>
            <span className="sp-card-level-value sp-card-level-value--rr">{rr ?? "—"}</span>
          </div>
        </div>
      ) : (
        <div className="sp-card-locked">🔒 {row.premium_preview_snippet ?? "Premium abonelik gerekli"}</div>
      )}

      {!locked && row.rationale ? <p className="sp-card-rationale line-clamp-2">{row.rationale}</p> : null}

      <div className="sp-card-footer">
        <div className="sp-card-analyst-block">
          <Link href={`/channel/${row.creator_id}`} className="sp-card-avatar" onClick={(e) => e.stopPropagation()}>
            {row.analyst.display.slice(0, 1).toUpperCase()}
          </Link>
          <div className="sp-card-analyst-meta">
            <div className="sp-card-analyst-name-row">
              <Link
                href={`/channel/${row.creator_id}`}
                className="sp-card-analyst-name"
                onClick={(e) => e.stopPropagation()}
              >
                {row.analyst.display}
              </Link>
              {row.analyst.verified ? (
                <span className="sp-card-verified" aria-label="Doğrulandı">
                  ✓
                </span>
              ) : null}
            </div>
            <div className="sp-card-analyst-role">
              {row.analyst.accuracy != null ? `%${row.analyst.accuracy} isabet` : "Analist"}
            </div>
          </div>
        </div>

        <div className="sp-card-right">
          <div className="sp-card-engagement">
            {row.likes_count > 0 ? (
              <span className="sp-card-eng-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 21s-6.7-4.35-9-8c-1.5-2.5-1-5.5 1.5-7 2.2-1.3 5-.6 7 1.5 2-2.1 4.8-2.8 7-1.5 2.5 1.5 3 4.5 1.5 7-2.3 3.65-9 8-9 8Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                {row.likes_count}
              </span>
            ) : null}
            {row.copies_count > 0 ? (
              <span className="sp-card-eng-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                {row.copies_count}
              </span>
            ) : null}
          </div>

          <div className="sp-card-actions">
            <button type="button" className="sp-card-action-btn" title="Kopyala" onClick={copyToClipboard}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={cn("sp-card-action-btn", saved && "sp-card-action-btn--saved")}
              title={saved ? "Kayıtlı" : "Kaydet"}
              aria-pressed={saved}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} aria-hidden>
                <path
                  d="M12 21s-6.7-4.35-9-8c-1.5-2.5-1-5.5 1.5-7 2.2-1.3 5-.6 7 1.5 2-2.1 4.8-2.8 7-1.5 2.5 1.5 3 4.5 1.5 7-2.3 3.65-9 8-9 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="sp-card-action-btn"
              title="Paylaş"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3v12M8 7l4-4 4 4M5 21h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});
