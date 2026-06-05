"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";

type Props = { symbol: string };

/** Varlık sayfası — topluluk merkezi özeti (SocialRepository). */
export function AssetCommunityHubPanel({ symbol }: Props) {
  const hub = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getAssetCommunityHub(symbol);
  }, [symbol]);

  if (!isMockDataEnabled()) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-3)]">
        <p className="text-[12px] font-medium text-[var(--color-meta)]">Varlık topluluğu: canlı modda veri bağlanınca görünecek.</p>
      </div>
    );
  }

  if (!hub) {
    return (
      <EmptyState title="Topluluk özeti yok" description="Bu sembol için mock küme tanımlı değil." tone="market" compact />
    );
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] p-[var(--sp-3)] shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Varlık topluluğu</p>
          <h2 className="mt-0.5 text-[15px] font-bold text-[var(--color-text)]">
            {hub.symbol} · {hub.momentum_label}
          </h2>
          <p className="mt-1 text-[12px] font-medium text-[var(--color-text-secondary)]">{hub.sentiment_label}</p>
        </div>
        <Link href={`/results?q=${encodeURIComponent(hub.symbol)}&tab=communities`} className="text-[11px] font-semibold text-[var(--color-primary-dark)] hover:underline">
          Tema ara
        </Link>
      </div>
      <dl className="mt-3 grid gap-2 text-[11px] min-[520px]:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-bg)] px-2 py-1.5">
          <dt className="font-bold text-[var(--color-meta)]">Tez ayrışması</dt>
          <dd className="mt-0.5 font-semibold text-[var(--color-text)]">{hub.thesis_split_label}</dd>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-bg)] px-2 py-1.5">
          <dt className="font-bold text-[var(--color-meta)]">Yoğunluk</dt>
          <dd className="mt-0.5 font-semibold text-[var(--color-text)]">{hub.discussion_intensity_label}</dd>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-bg)] px-2 py-1.5">
          <dt className="font-bold text-[var(--color-meta)]">Katılım</dt>
          <dd className="mt-0.5 font-semibold text-[var(--color-text)]">{hub.participation_density_label}</dd>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-bg)] px-2 py-1.5">
          <dt className="font-bold text-[var(--color-meta)]">Üretici kümesi</dt>
          <dd className="mt-0.5 font-semibold text-[var(--color-text)]">{hub.creator_concentration_label}</dd>
        </div>
      </dl>
      {hub.active_rooms.length ? (
        <div className="mt-3">
          <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Aktif odalar</p>
          <ul className="m-0 mt-1 flex flex-wrap gap-1.5 p-0">
            {hub.active_rooms.map((r) => (
              <li key={r.id}>
                <Link
                  href={r.href}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]/35"
                >
                  {r.label}
                  <span className="text-[10px] text-[var(--color-meta)]">{r.heat_label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hub.active_signals.length ? (
        <div className="mt-3 border-t border-[var(--color-divider)] pt-3">
          <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Aktif sinyaller</p>
          <ul className="m-0 mt-1 list-none space-y-1 p-0">
            {hub.active_signals.map((s) => (
              <li key={s.signal_id}>
                <Link href={s.href} className="text-[12px] font-semibold text-[var(--color-primary-dark)] hover:underline">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hub.top_contributors.length ? (
        <div className="mt-3 border-t border-[var(--color-divider)] pt-3">
          <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Üst katkı</p>
          <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
            {hub.top_contributors.map((u) => (
              <li key={u.user_id} className="flex min-w-0 max-w-[140px] items-center gap-1.5">
                <img src={u.avatar_url ?? fallbackAvatar(u.user_id)} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-[var(--color-ring-subtle)]" loading="lazy" />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-[var(--color-text)]">{u.name}</p>
                  <p className="truncate text-[10px] text-[var(--color-meta)]">{u.handle}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hub.related_themes.length ? (
        <div className="mt-3 border-t border-[var(--color-divider)] pt-3">
          <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">İlgili temalar</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {hub.related_themes.slice(0, 6).map((t) => (
              <Link key={t.slug} href={t.href} className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]/35">
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      {hub.network_edges.length ? (
        <ul className="m-0 mt-3 list-none space-y-1 border-t border-[var(--color-divider)] pt-3 p-0">
          {hub.network_edges.map((e) => (
            <li key={e.id}>
              <Link href={e.href} className="text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary-dark)]">
                {e.text}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-[10px] font-medium text-[var(--color-meta)]">{hub.overlapping_creators_note}</p>
    </section>
  );
}
