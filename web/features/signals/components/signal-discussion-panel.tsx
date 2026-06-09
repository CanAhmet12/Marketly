"use client";

import Link from "next/link";
import { useMemo } from "react";

import type { SignalThreadPack } from "@/features/signals/community/types";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { threadEntryBadge } from "@/mock/adapters/signal-thread-pack";

type Props = {
  pack: SignalThreadPack | null;
  symbol: string;
  assetHref: string;
  signalsHref: string;
  locked?: boolean;
  onNavigate?: () => void;
  signalId?: string;
};

function formatShortTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function SignalDiscussionPanel({ pack, symbol, assetHref, signalsHref, locked, onNavigate, signalId }: Props) {
  const linked = useMemo(() => {
    if (!signalId || !isMockDataEnabled()) return [];
    return getSocialRepository().getSignalLinkedDiscussions(signalId);
  }, [signalId]);
  const previewEntries = useMemo(() => {
    if (!pack?.entries.length) return [];
    return [...pack.entries].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()).slice(-5);
  }, [pack]);

  if (!pack) {
    return (
      <div className="ms-metric-block p-[var(--sp-3)]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Tartışma</p>
        <p className="mt-1.5 text-[12px] font-medium text-[var(--color-text-secondary)]">Bu çağrı için thread verisi yok.</p>
      </div>
    );
  }

  const { reactions, sentimentSplit } = pack;
  const neutralBar = Math.max(0, 100 - sentimentSplit.bullPct - sentimentSplit.bearPct);

  return (
    <div className="ms-metric-block p-[var(--sp-3)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Thread ve tartışma</p>
          <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
            {pack.replyCount} yanıt · {pack.quoteCount} alıntı · {symbol}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <Link
            href={assetHref}
            onClick={onNavigate}
            className="rounded-full border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/35"
          >
            Varlık
          </Link>
          <Link
            href={signalsHref}
            onClick={onNavigate}
            className="rounded-full border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/35"
          >
            Pazarda
          </Link>
        </div>
      </div>

      {pack.pinnedNote ? (
        <p className="mt-2 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_25%,var(--ms-border-hairline))] bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] px-2 py-1.5 text-[11px] font-semibold leading-snug text-[var(--color-text)]">
          <span className="text-[var(--color-meta)]">Sabit üretici notu · </span>
          {pack.pinnedNote}
        </p>
      ) : null}

      <div className="mt-2 flex h-1.5 w-full max-w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
        <div className="h-full bg-[color-mix(in_srgb,var(--color-rise)_65%,var(--color-rise))]" style={{ width: `${sentimentSplit.bullPct}%` }} title="Boğa" />
        <div className="h-full bg-[color-mix(in_srgb,var(--color-fall)_60%,var(--color-fall))]" style={{ width: `${sentimentSplit.bearPct}%` }} title="Ayı" />
        <div className="h-full bg-[color-mix(in_srgb,var(--color-meta)_50%,var(--color-surface))]" style={{ width: `${neutralBar}%` }} title="Nötr" />
      </div>
      <p className="mt-1 text-[11px] font-medium text-[var(--color-meta)]">
        Katılım hissi · %{sentimentSplit.bullPct} boğa · %{sentimentSplit.bearPct} ayı
      </p>

      <div className="mt-2 flex flex-wrap gap-1">
        <span className="inline-flex items-center rounded-md bg-[color-mix(in_srgb,var(--color-rise)_12%,transparent)] px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-emerald-800 ring-1 ring-emerald-500/20">
          ↑ {reactions.bullish}
        </span>
        <span className="inline-flex items-center rounded-md bg-[color-mix(in_srgb,var(--color-fall)_12%,transparent)] px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-red-800 ring-1 ring-red-500/20">
          ↓ {reactions.bearish}
        </span>
        <span className="inline-flex items-center rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-text-secondary)] ring-1 ring-[var(--ms-border-hairline)]">
          İzleme {reactions.tracking}
        </span>
        <span className="inline-flex items-center rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-text-secondary)] ring-1 ring-[var(--ms-border-hairline)]">
          Kopya {reactions.copied}
        </span>
        <span className="inline-flex items-center rounded-md bg-[color-mix(in_srgb,var(--color-fall)_8%,transparent)] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-text-secondary)] ring-1 ring-[var(--ms-border-hairline)]">
          Anlaşmazlık {reactions.disagreed}
        </span>
      </div>

      <ul className="m-0 mt-3 max-h-[280px] list-none space-y-2 overflow-y-auto overflow-x-hidden p-0">
        {previewEntries.map((e) => (
          <li key={e.id} className="min-w-0 border-b border-[color-mix(in_srgb,var(--ms-border-hairline)_75%,transparent)] pb-2 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[var(--color-meta)]">
              <span className="rounded bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] px-1 py-px text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {threadEntryBadge(e.kind)}
              </span>
              {e.role === "creator" ? (
                <span className="rounded bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-1 py-px text-[11px] font-bold text-[var(--color-primary-dark)]">
                  Üretici
                </span>
              ) : null}
              <span className="truncate text-[var(--color-text)]">{e.displayName}</span>
              <span className="shrink-0 tabular-nums">· {formatShortTime(e.at)}</span>
              {e.sentiment ? (
                <span className="shrink-0 rounded px-1 py-px text-[11px] font-bold uppercase text-[var(--color-text-secondary)]">
                  {e.sentiment === "bullish" ? "Boğa" : e.sentiment === "bearish" ? "Ayı" : "Nötr"}
                </span>
              ) : null}
            </div>
            {e.quoteSnippet ? (
              <p className="mt-0.5 line-clamp-1 border-l-2 border-[var(--color-primary)]/40 pl-2 text-[11px] font-medium italic text-[var(--color-text-secondary)]">
                “{e.quoteSnippet}”
              </p>
            ) : null}
            {locked ? (
              <p className="mt-0.5 text-[11px] font-medium text-[var(--color-meta)]">Tam thread metni ücretli akışta.</p>
            ) : (
              <p className="mt-0.5 line-clamp-3 text-[12px] font-medium leading-snug text-[var(--color-text-secondary)]">{e.body}</p>
            )}
          </li>
        ))}
      </ul>

      {linked.length ? (
        <div className="mt-3 border-t border-[color-mix(in_srgb,var(--ms-border-hairline)_80%,transparent)] pt-2">
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Bağlı gönderiler</p>
          <ul className="m-0 mt-1.5 list-none space-y-1.5 p-0">
            {linked.map((l) => (
              <li key={l.post_id}>
                <Link href={l.href} onClick={onNavigate} className="text-[12px] font-semibold text-[var(--color-primary-dark)] hover:underline">
                  {l.title}
                </Link>
                <span className="mt-0.5 block text-[11px] text-[var(--color-meta)]">{l.heat}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
