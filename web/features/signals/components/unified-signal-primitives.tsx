"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { ChannelSignal } from "@/features/channel/types";
import type { SignalLifecyclePhase } from "@/features/signals/domain/signal-meta";
import { signalLifecycleLabel } from "@/features/signals/domain/signal-meta";
import type { SignalStrategy } from "@/features/signals/repository/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

import { SignalEconomyChipsRow, signalRowLocked } from "@/features/signals/components/signal-economy-ui";
import { SignalLevelsWithEconomyLock } from "@/features/signals/components/signal-levels-locked";
import { useMockSignalSubscriber } from "@/features/signals/hooks/use-mock-signal-subscriber";

export function unifiedDirectionPillClass(d: ChannelSignal["direction"]): string {
  if (d === "BUY") return "bg-[color-mix(in_srgb,var(--color-rise)_12%,transparent)] text-[var(--color-rise)]";
  if (d === "SELL") return "bg-[color-mix(in_srgb,var(--color-fall)_12%,transparent)] text-[var(--color-fall)]";
  return "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-[var(--color-meta)]";
}

export function strategyTacticLabel(s: SignalStrategy): string {
  const m: Record<SignalStrategy, string> = { scalp: "Scalp", swing: "Swing", long: "Uzun vade" };
  return m[s];
}

export function volatilityHintLabel(h: SignalsFeedRow["volatility_hint"]): string {
  const m = { low: "Vol düşük", medium: "Vol orta", high: "Vol yüksek" };
  return m[h];
}

export function sentimentAlignmentLabel(s: SignalsFeedRow["sentiment_alignment"]): string {
  const m = { bullish: "Tez ↑", bearish: "Tez ↓", neutral: "Nötr" };
  return m[s];
}

export function communityBiasLabel(b: SignalsFeedRow["community_bias"]): string {
  const m = { bullish: "Topluluk ↑", bearish: "Topluluk ↓", mixed: "Topluluk karışık" };
  return m[b];
}

export function thesisGradeLabel(g: SignalsFeedRow["thesis_grade"]): string {
  return `Tez ${g}`;
}

export function formatSignalPrice(n: number | null, maxFrac = 4): string {
  if (n == null) return "—";
  return n.toLocaleString("tr-TR", { maximumFractionDigits: maxFrac });
}

export function SignalDirectionPill({ direction, className }: { direction: ChannelSignal["direction"]; className?: string }) {
  return (
    <span className={cn("rounded-lg px-[var(--sp-2)] py-0.5 text-[11px] font-semibold uppercase tracking-wide", unifiedDirectionPillClass(direction), className)}>
      {direction}
    </span>
  );
}

export function SignalStatusFreshnessRow({
  lifecyclePhase,
  createdAt,
  freshnessScore,
  className,
  hideFreshnessScore,
}: {
  lifecyclePhase: SignalLifecyclePhase;
  createdAt: string;
  freshnessScore?: number;
  className?: string;
  /** Home akışı — teknik skoru gösterme */
  hideFreshnessScore?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-[var(--sp-2)] gap-y-1 text-[11px] font-semibold text-[var(--color-meta)]", className)}>
      <span className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-[var(--sp-2)] py-px text-[var(--color-text-secondary)]">
        {signalLifecycleLabel(lifecyclePhase)}
      </span>
      <span className="text-[var(--color-meta)]">· {formatTimeAgo(createdAt)}</span>
      {!hideFreshnessScore && freshnessScore != null ? (
        <span className="tabular-nums text-[var(--color-text-secondary)]">· Tazelik {freshnessScore}</span>
      ) : null}
    </div>
  );
}

export { SignalLevelsGrid } from "./signal-levels-grid";

export function SignalConvictionBar({ confidence, className }: { confidence: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, confidence));
  return (
    <div className={cn("min-w-[120px] flex-1", className)}>
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[var(--color-meta)]">
        <span>Tez gücü</span>
        <span className="tabular-nums text-[var(--color-text)]">%{pct}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
        <div className="h-full rounded-full bg-[color-mix(in_srgb,var(--color-primary)_55%,var(--color-rise))]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SignalAnalystTrustBlock({
  analyst,
  channelHref,
  size = "md",
  showSpecialties = true,
  onNavigate,
  signalHitRateLookbackPct = null,
  suppressSignalLookback = false,
}: {
  analyst: SignalsFeedRow["analyst"];
  channelHref: string;
  size?: "sm" | "md";
  showSpecialties?: boolean;
  onNavigate?: () => void;
  signalHitRateLookbackPct?: number | null;
  /** Detay panelinde katalog tabanlı isabet satırı gösteriliyorsa çiftlemeyi önler */
  suppressSignalLookback?: boolean;
}) {
  const av = size === "sm" ? 36 : 44;
  const tier = analyst.tier && analyst.tier !== "free" ? analyst.tier.toUpperCase() : null;
  return (
    <div className="flex min-w-0 items-start gap-[var(--sp-3)]">
      {analyst.avatar_url ? (
        <SafeAvatar src={analyst.avatar_url} alt={analyst.display} size={av} className="ring-1 ring-[var(--ms-border-hairline)]" />
      ) : (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,var(--ms-card-surface))] font-bold text-[var(--color-text)]",
            size === "sm" ? "h-9 w-9 text-[13px]" : "h-11 w-11 text-[14px]",
          )}
        >
          {analyst.display.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-[var(--sp-2)]">
          <Link href={channelHref} className="truncate text-[15px] font-semibold text-[var(--color-text)] hover:underline" onClick={onNavigate}>
            {analyst.display}
          </Link>
          {analyst.verified ? (
            <span className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-[var(--sp-2)] py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Onaylı
            </span>
          ) : null}
          {tier ? (
            <span className="rounded-md border border-[var(--ms-border-hairline)] px-[var(--sp-2)] py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">
              {tier}
            </span>
          ) : null}
        </div>
        {analyst.strategy_style ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-[var(--color-text-secondary)]">{analyst.strategy_style}</p>
        ) : null}
        <p className="mt-0.5 text-[12px] font-medium tabular-nums text-[var(--color-meta)]">
          {analyst.follower_count.toLocaleString("tr-TR")} takipçi
          {analyst.accuracy != null ? ` · %${analyst.accuracy} kümülatif` : ""}
        </p>
        {!suppressSignalLookback && signalHitRateLookbackPct != null ? (
          <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-text-secondary)]">Son 20 sinyal · %{signalHitRateLookbackPct} isabet</p>
        ) : null}
        {showSpecialties && analyst.specialties && analyst.specialties.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {analyst.specialties.slice(0, 4).map((s) => (
              <span
                key={s}
                className="max-w-full truncate rounded-full border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2 py-px text-[11px] font-semibold text-[var(--color-text-secondary)]"
              >
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SignalEngagementInline({
  likes,
  copies,
  copies24h,
  discussionActive,
  creatorReplied,
  subscriberCopies24h,
  premiumDiscussion,
  strategyUpdate,
  className,
}: {
  likes: number;
  copies: number;
  copies24h?: number;
  discussionActive?: boolean;
  creatorReplied?: boolean;
  subscriberCopies24h?: number | null;
  premiumDiscussion?: boolean;
  strategyUpdate?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-x-[var(--sp-4)] gap-y-1 text-[12px] font-medium tabular-nums text-[var(--color-meta)]", className)}>
      <span>
        Beğeni <span className="font-semibold text-[var(--color-text-secondary)]">{likes.toLocaleString("tr-TR")}</span>
      </span>
      <span>
        Kopya <span className="font-semibold text-[var(--color-text-secondary)]">{copies.toLocaleString("tr-TR")}</span>
      </span>
      {copies24h != null && copies24h > 0 ? (
        <span>
          24s <span className="font-semibold text-[var(--color-text-secondary)]">{copies24h.toLocaleString("tr-TR")}</span>
        </span>
      ) : null}
      {subscriberCopies24h != null && subscriberCopies24h > 0 ? (
        <span>
          Abone 24s <span className="font-semibold text-[var(--color-text-secondary)]">{subscriberCopies24h.toLocaleString("tr-TR")}</span>
        </span>
      ) : null}
      {premiumDiscussion ? <span className="text-[var(--color-text-secondary)]">Üyelik içgörüsü</span> : null}
      {strategyUpdate ? <span className="text-[var(--color-text-secondary)]">Strateji güncellemesi</span> : null}
      {discussionActive ? <span className="text-[var(--color-primary-dark)]">Tartışma açık</span> : null}
      {creatorReplied ? <span className="text-[var(--color-text-secondary)]">Üretici yanıtı</span> : null}
    </div>
  );
}

/** Kanal / keşfet kompakt kart — tam feed satırı ile aynı dil */
export function UnifiedSignalCompactCard({
  row,
  footerRight,
  onActivate,
  embedded,
  homeTone,
}: {
  row: SignalsFeedRow;
  footerRight?: ReactNode;
  onActivate?: () => void;
  /** Liste / ızgara içinde dış çerçeve kullanılıyorsa iç gölgeyi kapat */
  embedded?: boolean;
  /** Home akışı — daha ince, teknik etiketleri azalt */
  homeTone?: boolean;
}) {
  const isSubscriber = useMockSignalSubscriber();
  const locked = signalRowLocked(row, isSubscriber);
  const entry = row.entryZoneLabel ?? formatSignalPrice(row.entry_price);
  const target = formatSignalPrice(row.target_price);
  const stop = formatSignalPrice(row.stop_loss);

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col overflow-hidden",
        embedded ? "bg-transparent" : "ms-card-terminal ms-card-terminal--lift",
        onActivate ? "cursor-pointer" : "",
        row.signal_access !== "public" && !embedded && "ring-1 ring-[color-mix(in_srgb,var(--color-primary)_20%,var(--ms-border-hairline))]",
      )}
      role={onActivate ? "button" : undefined}
      tabIndex={onActivate ? 0 : undefined}
      onClick={onActivate}
      onKeyDown={
        onActivate
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActivate();
              }
            }
          : undefined
      }
    >
      <div
        className={cn(
          "flex flex-wrap items-start gap-[var(--sp-3)] min-[640px]:flex-nowrap",
          homeTone ? "p-3 min-[640px]:p-3" : "p-[var(--sp-3)] min-[640px]:p-[var(--sp-4)]",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-[var(--sp-2)]">
          <div className="flex flex-wrap items-center gap-[var(--sp-2)]">
            <h2
              className={cn(
                "font-bold leading-none tracking-[-0.03em] text-[var(--color-text)]",
                homeTone ? "text-[17px] min-[400px]:text-[18px]" : "text-[18px] min-[400px]:text-[20px]",
              )}
            >
              {row.symbol}
            </h2>
            <SignalDirectionPill direction={row.direction} />
            <span className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-[var(--sp-2)] py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
              {strategyTacticLabel(row.strategy)}
            </span>
            <span className="text-[11px] font-semibold tabular-nums text-[var(--color-meta)]">{row.timeframe}</span>
          </div>
          <SignalStatusFreshnessRow
            lifecyclePhase={row.lifecycle_phase}
            createdAt={row.created_at}
            freshnessScore={row.freshness_score}
            hideFreshnessScore={Boolean(homeTone)}
          />
          {!homeTone ? <SignalEconomyChipsRow row={row} dense className="mt-1" /> : null}
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">{row.asset_display_name}</p>
          {!homeTone ? <SignalConvictionBar confidence={row.confidence} className="max-w-md" /> : (
            <p className="text-[11px] font-medium text-[var(--color-meta)]">
              Tez gücü <span className="tabular-nums font-semibold text-[var(--color-text-secondary)]">%{Math.min(100, Math.max(0, row.confidence))}</span>
            </p>
          )}
          {locked ? (
            <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">
              <span className="font-semibold text-[var(--color-meta)]">Önizleme · </span>
              {row.premium_preview_snippet ?? "—"}
            </p>
          ) : row.rationale ? (
            <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">{row.rationale}</p>
          ) : null}
        </div>
        <div className={cn("w-full min-[640px]:shrink-0", homeTone ? "min-[640px]:w-[180px]" : "min-[640px]:w-[200px]")}>
          <SignalLevelsWithEconomyLock entryLabel={entry} targetLabel={target} stopLabel={stop} rrLabel={row.riskRewardLabel} dense locked={locked} />
        </div>
      </div>
      <div
        className={cn(
          "border-t px-[var(--sp-3)] py-[var(--sp-3)]",
          embedded || homeTone ? "border-[color-mix(in_srgb,var(--color-divider)_55%,transparent)]" : "border-[var(--ms-border-hairline)]",
        )}
      >
        <div className="flex flex-col gap-[var(--sp-3)] min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
          <SignalAnalystTrustBlock
            analyst={row.analyst}
            channelHref={`/channel/${row.creator_id}`}
            size="sm"
            signalHitRateLookbackPct={row.signal_hit_rate_lookback_pct}
          />
          <div className="flex flex-wrap items-center justify-between gap-[var(--sp-3)] min-[520px]:justify-end">
            <SignalEngagementInline
              likes={row.likes_count}
              copies={row.copies_count}
              copies24h={row.community_copies_24h}
              discussionActive={row.discussion_active}
              creatorReplied={row.creator_replied_recently}
              subscriberCopies24h={row.subscriber_copies_24h}
              premiumDiscussion={row.premium_discussion}
              strategyUpdate={row.strategy_update_ping}
            />
            {footerRight}
          </div>
        </div>
      </div>
    </article>
  );
}
