"use client";

import Link from "next/link";

import type { SignalDetailExtension, SignalTimelineEvent } from "@/features/signals/lib/signal-detail-types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { signalStatusKey, signalStatusLabel } from "@/features/signals/domain/signal-meta";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

import { sentimentAlignmentLabel, SignalDirectionPill, thesisGradeLabel, volatilityHintLabel } from "./unified-signal-primitives";

function timelineDotBg(kind: SignalTimelineEvent["kind"]): string {
  if (kind === "target_hit" || kind === "closed_win" || kind === "partial_tp") return "bg-[color-mix(in_srgb,var(--color-rise)_70%,var(--color-rise))]";
  if (kind === "stopped" || kind === "closed_loss") return "bg-[color-mix(in_srgb,var(--color-fall)_65%,var(--color-fall))]";
  if (kind === "expired") return "bg-[var(--color-meta)]";
  return "bg-[color-mix(in_srgb,var(--color-primary)_50%,var(--color-primary))]";
}

export function SignalDetailThesisContextChips({ row }: { row: SignalsFeedRow }) {
  return (
    <div className="mt-[var(--sp-2)] flex flex-wrap gap-1.5">
      <span className="rounded-md border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2 py-px text-[11px] font-semibold text-[var(--color-text-secondary)]">
        {thesisGradeLabel(row.thesis_grade)}
      </span>
      <span className="rounded-md border border-[var(--ms-border-hairline)] px-2 py-px text-[11px] font-semibold text-[var(--color-text-secondary)]">{volatilityHintLabel(row.volatility_hint)}</span>
      <span className="rounded-md border border-[var(--ms-border-hairline)] px-2 py-px text-[11px] font-semibold text-[var(--color-text-secondary)]">{sentimentAlignmentLabel(row.sentiment_alignment)}</span>
      <span className="rounded-md border border-[var(--ms-border-hairline)] px-2 py-px text-[11px] font-semibold tabular-nums text-[var(--color-meta)]">{row.timeframe_category}</span>
    </div>
  );
}

export function SignalDetailArchiveOutcomeStrip({ row }: { row: SignalsFeedRow }) {
  const key = signalStatusKey(row);
  const isArchive = !row.is_active || row.result === "TP" || row.result === "SL";
  if (!isArchive) return null;
  const outcome =
    row.result === "TP"
      ? "Hedef gerçekleşti — arşivde ölçülebilir sonuç"
      : row.result === "SL"
        ? "Stop ile kapanış — risk çerçevesi korundu"
        : "Pasif / süre sonu — arşiv özetine taşındı";
  return (
    <div className="rounded-[12px] border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--ms-card-surface))] px-[var(--sp-3)] py-[var(--sp-2)]">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Arşiv özeti</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">{signalStatusLabel(key)}</span>
        <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{outcome}</span>
      </div>
    </div>
  );
}

function SubtleMeter({ label, pct, tone }: { label: string; pct: number; tone: "target" | "stop" | "neutral" }) {
  const p = Math.min(100, Math.max(0, pct));
  const fill =
    tone === "target"
      ? "bg-[color-mix(in_srgb,var(--color-primary)_45%,var(--color-rise))]"
      : tone === "stop"
        ? "bg-[color-mix(in_srgb,var(--color-fall)_55%,var(--color-fall))]"
        : "bg-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[11px] font-semibold text-[var(--color-meta)]">
        <span>{label}</span>
        <span className="tabular-nums text-[var(--color-text-secondary)]">%{p}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]">
        <div className={cn("h-full rounded-full transition-all duration-300", fill)} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

export function SignalDetailPerformanceIntel({ perf }: { perf: SignalDetailExtension["performance"] }) {
  const pnl = perf.currentPnlPct;
  const pnlCls =
    pnl == null ? "text-[var(--color-meta)]" : pnl > 0.5 ? "text-[var(--color-rise)]" : pnl < -0.5 ? "text-[var(--color-fall)]" : "text-[var(--color-text-secondary)]";
  return (
    <div className="ms-metric-block space-y-[var(--sp-3)] p-[var(--sp-3)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Performans</p>
      <div className="flex flex-wrap items-end gap-x-[var(--sp-4)] gap-y-1">
        <div>
          <p className="text-[11px] font-semibold uppercase text-[var(--color-meta)]">Anlık P/L (önizleme)</p>
          <p className={cn("text-[20px] font-bold tabular-nums tracking-tight", pnlCls)}>{pnl == null ? "—" : `${pnl > 0 ? "+" : ""}${pnl.toFixed(1)}%`}</p>
        </div>
        <div className="min-w-[120px] flex-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
          <p>
            Süre: <span className="font-semibold tabular-nums text-[var(--color-text)]">{perf.hoursActive} sa</span>
          </p>
          {perf.estimatedHoursToTarget != null ? (
            <p className="mt-0.5">
              Hedefe tahmini: <span className="font-semibold tabular-nums text-[var(--color-text)]">~{perf.estimatedHoursToTarget} sa</span>
            </p>
          ) : (
            <p className="mt-0.5 text-[var(--color-meta)]">Hedef süresi — bağlam yetersiz</p>
          )}
        </div>
      </div>
      {perf.targetProgressPct != null || perf.stopHeadroomPct != null ? (
        <div className="grid gap-[var(--sp-3)] min-[400px]:grid-cols-2">
          {perf.targetProgressPct != null ? <SubtleMeter label="Hedefe yaklaşım" pct={perf.targetProgressPct} tone="target" /> : null}
          {perf.stopHeadroomPct != null ? <SubtleMeter label="Stop mesafesi (tampon)" pct={perf.stopHeadroomPct} tone="stop" /> : null}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-x-[var(--sp-3)] gap-y-1 border-t border-[color-mix(in_srgb,var(--ms-border-hairline)_80%,transparent)] pt-[var(--sp-2)] text-[11px] font-medium text-[var(--color-text-secondary)]">
        <span className="line-clamp-2">Yörünge: {perf.trajectoryLabel}</span>
        {perf.riskAdjustedScore != null ? (
          <span className="tabular-nums text-[var(--color-meta)]">Risk-ayarlı skor {perf.riskAdjustedScore}/3</span>
        ) : null}
      </div>
      {perf.recentLegLabel ? <p className="text-[11px] font-semibold text-[var(--color-meta)]">{perf.recentLegLabel}</p> : null}
    </div>
  );
}

export function SignalDetailTimelineIntel({ events }: { events: SignalDetailExtension["timeline"] }) {
  return (
    <div className="ms-metric-block p-[var(--sp-3)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Zaman çizelgesi</p>
      <ol className="m-0 mt-[var(--sp-3)] list-none space-y-0 p-0">
        {events.map((ev, i) => (
          <li key={`${ev.kind}-${ev.at}-${i}`} className="relative flex gap-3 pb-[var(--sp-3)] last:pb-0">
            {i < events.length - 1 ? (
              <span className="absolute left-[4px] top-2.5 bottom-0 w-px bg-[color-mix(in_srgb,var(--ms-border-hairline)_90%,transparent)]" aria-hidden />
            ) : null}
            <span
              className={cn(
                "relative z-[1] mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-[var(--ms-border-hairline)]",
                timelineDotBg(ev.kind),
              )}
            />
            <div className="min-w-0 flex-1 border-l-2 border-transparent ps-0">
              <p className="text-[12px] font-bold text-[var(--color-text)]">{ev.label}</p>
              {ev.detail ? <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">{ev.detail}</p> : null}
              <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-meta)]">{formatTimeAgo(ev.at)} · {new Date(ev.at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SignalDetailCreatorTrackIntel({ rec }: { rec: SignalDetailExtension["creatorRecord"] }) {
  const last20Label = rec.last20Total > 0 ? `${rec.last20Hits}/${rec.last20Total} TP` : "Veri az";
  return (
    <div className="mt-[var(--sp-4)] ms-metric-block p-[var(--sp-3)]">
      <p className="mt-1 text-[11px] font-medium text-[var(--color-text-secondary)]">Katalogdaki kapananlar üzerinden özet — şeffaflık için canlıda RPC ile güncellenecek.</p>
      <div className="mt-[var(--sp-3)] grid grid-cols-2 gap-[var(--sp-2)] min-[420px]:grid-cols-3">
        <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-[var(--sp-2)] py-[var(--sp-2)]">
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Kazanma</p>
          <p className="mt-0.5 text-[15px] font-bold tabular-nums text-[var(--color-text)]">{rec.winRatePct == null ? "—" : `%${rec.winRatePct}`}</p>
        </div>
        <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-[var(--sp-2)] py-[var(--sp-2)]">
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Son 20</p>
          <p className="mt-0.5 text-[15px] font-bold tabular-nums text-[var(--color-text)]">{last20Label}</p>
        </div>
        <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-[var(--sp-2)] py-[var(--sp-2)]">
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Ort. R/R</p>
          <p className="mt-0.5 text-[15px] font-bold tabular-nums text-[var(--color-text)]">{rec.avgRiskReward == null ? "—" : rec.avgRiskReward.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-[var(--sp-2)] py-[var(--sp-2)]">
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Aktif</p>
          <p className="mt-0.5 text-[15px] font-bold tabular-nums text-[var(--color-text)]">{rec.activeSignals}</p>
        </div>
        <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-[var(--sp-2)] py-[var(--sp-2)]">
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Kapanan</p>
          <p className="mt-0.5 text-[13px] font-bold tabular-nums text-[var(--color-text)]">
            <span className="text-[var(--color-rise)]">{rec.closedGreen}</span>
            <span className="text-[var(--color-meta)]"> / </span>
            <span className="text-[var(--color-fall)]">{rec.closedRed}</span>
          </p>
        </div>
        <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-[var(--sp-2)] py-[var(--sp-2)]">
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Seri TP</p>
          <p className="mt-0.5 text-[15px] font-bold tabular-nums text-[var(--color-text)]">{rec.streakWins}</p>
        </div>
      </div>
      <div className="mt-[var(--sp-2)] flex flex-wrap items-center justify-between gap-2 border-t border-[color-mix(in_srgb,var(--ms-border-hairline)_80%,transparent)] pt-[var(--sp-2)]">
        <p className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
          Tutarlılık <span className="tabular-nums text-[var(--color-text)]">{rec.consistencyScore}</span>/100
        </p>
        {rec.specialtyStrengthLabel ? (
          <span className="max-w-[min(100%,14rem)] truncate rounded-full border border-[var(--ms-border-hairline)] px-2 py-px text-[11px] font-semibold text-[var(--color-text-secondary)]">{rec.specialtyStrengthLabel}</span>
        ) : null}
      </div>
    </div>
  );
}

function RelatedRowLink({ r, onNavigate }: { r: SignalsFeedRow; onNavigate?: () => void }) {
  const closed = !r.is_active;
  return (
    <li>
      <Link
        href={r.detail_href}
        onClick={onNavigate}
        className="flex flex-wrap items-center gap-2 rounded-lg px-[var(--sp-2)] py-1.5 text-[12px] font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
      >
        <span className="font-bold text-[var(--color-text)]">{r.symbol}</span>
        <SignalDirectionPill direction={r.direction} className="!py-px text-[11px]" />
        <span className="tabular-nums text-[var(--color-meta)]">{new Date(r.created_at).toLocaleDateString("tr-TR")}</span>
        {closed ? (
          <span className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-1.5 py-px text-[11px] font-bold uppercase text-[var(--color-text-secondary)]">Arşiv</span>
        ) : (
          <span className="rounded-md bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-1.5 py-px text-[11px] font-bold uppercase text-[var(--color-primary-dark)]">Aktif</span>
        )}
        {r.result === "TP" ? <span className="text-[11px] font-bold text-[var(--color-rise)]">TP</span> : null}
        {r.result === "SL" ? <span className="text-[11px] font-bold text-[var(--color-fall)]">SL</span> : null}
      </Link>
    </li>
  );
}

function dedupeAppend(base: SignalsFeedRow[], extra: SignalsFeedRow[]): SignalsFeedRow[] {
  const seen = new Set(base.map((r) => r.id));
  const out = [...base];
  for (const r of extra) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

export function SignalDetailRelatedIntelSections({
  related,
  similar,
  onNavigate,
}: {
  related: SignalDetailExtension["related"];
  similar: SignalsFeedRow[];
  onNavigate?: () => void;
}) {
  const alreadyLinked = dedupeAppend(
    dedupeAppend([...related.historicalSameAsset], related.creatorFollowUps),
    related.archivedSameSymbol,
  );
  const seenIds = new Set(alreadyLinked.map((r) => r.id));
  const similarOnly = similar.filter((r) => !seenIds.has(r.id));

  const hasAny =
    related.historicalSameAsset.length > 0 ||
    related.creatorFollowUps.length > 0 ||
    related.archivedSameSymbol.length > 0 ||
    similarOnly.length > 0;

  if (!hasAny) return null;

  return (
    <div className="space-y-[var(--sp-4)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">İlişkili zekâ</p>

      {related.historicalSameAsset.length ? (
        <div>
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Aynı varlık — geçmiş çağrılar</p>
          <ul className="m-0 mt-1 list-none space-y-0.5 p-0">{related.historicalSameAsset.map((r) => <RelatedRowLink key={r.id} r={r} onNavigate={onNavigate} />)}</ul>
        </div>
      ) : null}

      {related.creatorFollowUps.length ? (
        <div>
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Üretici — devam çağrıları</p>
          <ul className="m-0 mt-1 list-none space-y-0.5 p-0">{related.creatorFollowUps.map((r) => <RelatedRowLink key={r.id} r={r} onNavigate={onNavigate} />)}</ul>
        </div>
      ) : null}

      {related.archivedSameSymbol.length ? (
        <div>
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Arşiv — aynı sembol</p>
          <ul className="m-0 mt-1 list-none space-y-0.5 p-0">{related.archivedSameSymbol.map((r) => <RelatedRowLink key={r.id} r={r} onNavigate={onNavigate} />)}</ul>
        </div>
      ) : null}

      {similarOnly.length ? (
        <div>
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Yakın çağrılar (sembol)</p>
          <ul className="m-0 mt-1 list-none space-y-0.5 p-0">
            {similarOnly.map((r) => (
              <RelatedRowLink key={r.id} r={r} onNavigate={onNavigate} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function SignalDetailCreatorUpdatesIntel({ lines }: { lines: SignalDetailExtension["creatorUpdates"] }) {
  if (!lines.length) return null;
  return (
    <div className="mt-[var(--sp-4)] ms-metric-block p-[var(--sp-3)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Üretici güncellemeleri</p>
      <ul className="m-0 mt-[var(--sp-2)] list-none space-y-[var(--sp-2)] p-0">
        {lines.map((ln, i) => (
          <li key={`${ln.at}-${i}`} className="border-b border-[color-mix(in_srgb,var(--ms-border-hairline)_80%,transparent)] pb-[var(--sp-2)] last:border-0 last:pb-0">
            <p className="text-[11px] font-semibold tabular-nums text-[var(--color-meta)]">
              {new Date(ln.at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="mt-0.5 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">{ln.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
