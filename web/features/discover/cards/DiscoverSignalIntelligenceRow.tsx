"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { FeedPost } from "@/features/feed/types";
import { signalLifecycleLabel } from "@/features/signals/domain/signal-meta";
import { signalRowLocked } from "@/features/signals/components/signal-economy-ui";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { formatSignalPrice, strategyTacticLabel } from "@/features/signals/components/unified-signal-primitives";
import { useMockSignalSubscriber } from "@/features/signals/hooks/use-mock-signal-subscriber";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { HomeFeedEngagementRow } from "@/features/home/cards/home-feed-engagement-row";
import { homeHrefForSignalPost } from "@/features/home/routing";
import { formatCompactCount } from "@/lib/format-compact-count";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

function DirectionIntel({ direction }: { direction: SignalsFeedRow["direction"] }) {
  const base =
    "pointer-events-auto relative z-[3] inline-flex shrink-0 items-center rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide tabular-nums ring-1 ring-inset";
  if (direction === "BUY") {
    return (
      <span className={cn(base, "bg-[color-mix(in_srgb,#15803d_10%,transparent)] text-emerald-900/85 ring-emerald-800/18")} title="Alış">
        {direction}
      </span>
    );
  }
  if (direction === "SELL") {
    return (
      <span className={cn(base, "bg-[color-mix(in_srgb,#be123c_8%,transparent)] text-rose-900/82 ring-rose-800/16")} title="Satış">
        {direction}
      </span>
    );
  }
  return (
    <span className={cn(base, "bg-[color-mix(in_srgb,var(--hv-text)_6%,transparent)] text-[var(--hv-text-2)] ring-[color-mix(in_srgb,var(--hv-sep)_50%,transparent)]")} title="Bekle">
      {direction}
    </span>
  );
}

type Props = {
  row: SignalsFeedRow;
  post: FeedPost | null;
  engagement: HomeEngagementHandlers;
};

export function DiscoverSignalIntelligenceRow({ row, post, engagement }: Props) {
  const isSubscriber = useMockSignalSubscriber();
  const locked = signalRowLocked(row, isSubscriber);
  const detailHref = post ? homeHrefForSignalPost(post.id) : row.detail_href;
  const marketHref = `/signals?asset=${encodeURIComponent(row.symbol)}`;

  const entry = row.entryZoneLabel ?? formatSignalPrice(row.entry_price);
  const target = formatSignalPrice(row.target_price);
  const stop = formatSignalPrice(row.stop_loss);
  const conf = Math.min(100, Math.max(0, row.confidence));
  const thesis = locked ? row.premium_preview_snippet ?? "—" : row.rationale?.trim() || row.asset_display_name;
  const rr = row.riskRewardLabel ? `R/R ${row.riskRewardLabel}` : null;
  const levelsLine = `G ${entry} · H ${target} · S ${stop}`;

  return (
    <article
      className={cn(
        "discover-signal-intel group relative min-h-0 overflow-hidden rounded-md",
        "border border-[color-mix(in_srgb,var(--hv-sep)_45%,transparent)] bg-[color-mix(in_srgb,var(--hv-text)_2.5%,transparent)]",
        "transition-[background-color,box-shadow] duration-150 hover:bg-[color-mix(in_srgb,var(--hv-text)_4%,transparent)]",
      )}
    >
      <Link href={detailHref} className="absolute inset-0 z-0" aria-label={`${row.symbol} sinyali — ayrıntı`} />

      <div className="pointer-events-none relative z-[2] flex min-w-0 flex-col gap-1.5 p-2 sm:flex-row sm:items-stretch sm:gap-3 sm:p-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <Link
              href={marketHref}
              className="pointer-events-auto relative z-[3] text-[1.0625rem] font-bold tabular-nums tracking-tight text-[var(--hv-text)] underline-offset-2 hover:underline sm:text-[1.125rem]"
            >
              {row.symbol}
            </Link>
            <DirectionIntel direction={row.direction} />
            <span className="text-[9px] font-medium tabular-nums text-[var(--hv-text-3)]">{row.timeframe}</span>
            <span className="rounded bg-[color-mix(in_srgb,var(--hv-text)_5%,transparent)] px-1 py-px text-[9px] font-semibold text-[var(--hv-text-3)] ring-1 ring-[color-mix(in_srgb,var(--hv-sep)_40%,transparent)]">
              {strategyTacticLabel(row.strategy)}
            </span>
            <span className="text-[9px] font-medium tabular-nums text-[var(--hv-text-3)]">{signalLifecycleLabel(row.lifecycle_phase)}</span>
            {locked ? (
              <span
                className="inline-flex max-w-full items-center gap-0.5 truncate rounded px-1 py-px text-[9px] font-medium text-[var(--hv-text-3)] ring-1 ring-[color-mix(in_srgb,var(--hv-sep)_35%,transparent)]"
                title="Abonelik ile tam tez ve seviyeler"
              >
                Kilitli
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-[var(--hv-text-2)] sm:line-clamp-1">{thesis}</p>

          <p className="mt-0.5 truncate text-[10px] font-medium tabular-nums text-[var(--hv-text-3)]">
            <span className="text-[var(--hv-text-2)]">{levelsLine}</span>
            {rr ? <span className="mx-1.5 text-[var(--hv-text-3)]">·</span> : null}
            {rr ? <span>{rr}</span> : null}
            <span className="mx-1.5 text-[var(--hv-text-3)]">·</span>
            <span>
              Tez <span className="font-semibold text-[var(--hv-text-2)]">%{conf}</span>
            </span>
            <span className="mx-1.5 text-[var(--hv-text-3)]">·</span>
            <span className="tabular-nums">{formatTimeAgo(row.created_at)}</span>
          </p>
        </div>

        <div className="flex min-w-0 shrink-0 flex-row items-center justify-between gap-2 border-t border-[color-mix(in_srgb,var(--hv-sep)_40%,transparent)] pt-1.5 sm:w-[min(11rem,32%)] sm:flex-col sm:items-stretch sm:justify-center sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <Link href={`/channel/${row.creator_id}`} className="pointer-events-auto relative z-[3] shrink-0" tabIndex={-1}>
              {row.analyst.avatar_url ? (
                <SafeAvatar
                  src={row.analyst.avatar_url}
                  alt=""
                  size={24}
                  className="h-6 w-6 rounded-full ring-1 ring-[color-mix(in_srgb,var(--hv-sep)_50%,transparent)]"
                />
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--hv-text)_7%,transparent)] text-[10px] font-bold text-[var(--hv-text)] ring-1 ring-[color-mix(in_srgb,var(--hv-sep)_50%,transparent)]">
                  {row.analyst.display.slice(0, 1).toUpperCase()}
                </span>
              )}
            </Link>
            <div className="min-w-0">
              <Link
                href={`/channel/${row.creator_id}`}
                className="pointer-events-auto relative z-[3] block truncate text-[11px] font-semibold text-[var(--hv-text)] underline-offset-2 hover:underline"
              >
                {row.analyst.display}
              </Link>
              {row.analyst.accuracy != null ? (
                <span className="tabular-nums text-[9px] text-[var(--hv-text-3)]">%{row.analyst.accuracy} güven</span>
              ) : null}
            </div>
          </div>
          <div className="pointer-events-auto relative z-[3] flex shrink-0 flex-col items-end gap-0.5 sm:items-stretch">
            <Link href={detailHref} className="text-end text-[10px] font-semibold text-[var(--hv-text-2)] underline-offset-2 hover:underline sm:text-start">
              Detay
            </Link>
            <Link
              href={marketHref}
              className="text-end text-[9px] font-semibold text-[var(--hv-text-3)] underline-offset-2 hover:text-[var(--hv-text-2)] hover:underline sm:text-start"
            >
              Sinyal pazarı
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto relative z-[2] border-t border-[color-mix(in_srgb,var(--hv-sep)_38%,transparent)] bg-[color-mix(in_srgb,var(--hv-text)_1.5%,transparent)] px-2 py-1 sm:px-2.5">
        {post ? (
          <HomeFeedEngagementRow post={post} commentHref={detailHref} engagement={engagement} variant="compact" />
        ) : (
          <p className="m-0 text-[10px] font-medium tabular-nums text-[var(--hv-text-3)]">
            <span className="text-[var(--hv-text-2)]">Beğeni</span> {formatCompactCount(row.likes_count)}
            <span className="mx-2">·</span>
            <span className="text-[var(--hv-text-2)]">Kopya</span> {formatCompactCount(row.copies_count)}
          </p>
        )}
      </div>
    </article>
  );
}
