"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/states";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";
import { formatTimeAgo } from "@/lib/format-time-ago";

type Props = { channelUserId: string; focusRoomId?: string | null };

/** Kanal — üretici topluluk odaları (SocialRepository). */
export function CreatorCommunityRoomsPanel({ channelUserId, focusRoomId = null }: Props) {
  const surface = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getCreatorCommunityRoomsSurface(channelUserId);
  }, [channelUserId]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const selectedId = (focusRoomId && surface?.rooms.some((r) => r.id === focusRoomId) ? focusRoomId : null) ?? activeId ?? surface?.rooms[0]?.id ?? null;

  if (!isMockDataEnabled()) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-3)]">
        <p className="text-[12px] font-medium text-[var(--color-meta)]">Üretici odaları canlı modda bağlanınca burada görünecek.</p>
      </div>
    );
  }

  if (!surface || surface.rooms.length === 0) {
    return <EmptyState title="Oda yok" description="Bu üretici için mock oda kümesi tanımlı değil." compact />;
  }

  const selected = surface.rooms.find((r) => r.id === selectedId) ?? surface.rooms[0]!;
  const feed = surface.feed.filter((f) => f.room_id === selected.id);
  const pins = surface.pinned_notes.filter((p) => p.room_id === selected.id);

  return (
    <div className="space-y-[var(--sp-4)]">
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] p-[var(--sp-3)]">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Üretici odaları</p>
        <p className="mt-1 text-[12px] font-medium text-[var(--color-text-secondary)]">Sakin, analitik tartışma alanları — abone odaları kilit önizlemeli.</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {surface.rooms.map((r) => {
            const on = r.id === selected.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveId(r.id)}
                className={cn(
                  "max-w-full truncate rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                  on
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:border-[var(--color-primary)]/35",
                )}
              >
                {r.label}
                {r.is_premium ? <span className="ml-1 text-[10px] text-[var(--color-meta)]">· abone</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid min-w-0 gap-[var(--sp-3)] min-[720px]:grid-cols-[1fr_220px]">
        <div className="min-w-0 space-y-[var(--sp-3)]">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-2)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-[var(--color-text)]">{selected.label}</h3>
                <p className="mt-0.5 text-[11px] font-medium text-[var(--color-meta)]">
                  {selected.heat_label} · {selected.participant_density_label} · {selected.creator_present_label}
                </p>
              </div>
              {selected.premium_badge_label ? (
                <span className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))] px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary-dark)]">
                  {selected.premium_badge_label}
                </span>
              ) : null}
            </div>
            {selected.preview_locked ? (
              <p className="mt-2 rounded-md bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2 py-1.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
                Kilitli önizleme — abone olanlar tam thread ve alıntılı yanıtları görür.
              </p>
            ) : null}
            {selected.linked_symbol ? (
              <Link
                href={`/markets/${encodeURIComponent(selected.linked_symbol)}`}
                className="mt-2 inline-flex text-[11px] font-semibold text-[var(--color-primary-dark)] hover:underline"
              >
                {selected.linked_symbol} piyasası →
              </Link>
            ) : null}
            {selected.signal_thread_label ? (
              <p className="mt-1 text-[11px] text-[var(--color-meta)]">{selected.signal_thread_label}</p>
            ) : null}
          </div>

          {pins.length ? (
            <div className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-primary)_22%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] px-[var(--sp-3)] py-[var(--sp-2)]">
              <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Sabit not</p>
              {pins.map((p) => (
                <Link key={p.id} href={p.href} className="mt-1 block text-[12px] font-semibold text-[var(--color-text)] hover:text-[var(--color-primary-dark)]">
                  {p.body}
                </Link>
              ))}
            </div>
          ) : null}

          <div>
            <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Oda akışı</p>
            {feed.length === 0 ? (
              <p className="mt-2 text-[12px] text-[var(--color-muted)]">Bu odada henüz akış satırı yok.</p>
            ) : (
              <ul className="m-0 mt-2 list-none divide-y divide-[var(--color-divider)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0">
                {feed.map((row) => (
                  <li key={row.id}>
                    <Link href={row.href} className="block px-[var(--sp-3)] py-[var(--sp-2)] transition hover:bg-[var(--color-surface-hover)]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {row.pinned ? <span className="text-[10px] font-bold text-[var(--color-primary-dark)]">Sabit</span> : null}
                        {row.premium_only_preview ? <span className="text-[10px] font-bold text-[var(--color-meta)]">Premium önizleme</span> : null}
                        {row.creator_reacted ? <span className="text-[10px] font-bold text-[var(--color-meta)]">Üretici tepkisi</span> : null}
                      </div>
                      <p className="mt-0.5 text-[13px] font-semibold text-[var(--color-text)]">{row.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--color-text-secondary)]">{row.sub}</p>
                      <p className="mt-1 text-[10px] text-[var(--color-meta)]">{formatTimeAgo(row.created_at)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="min-w-0 space-y-[var(--sp-3)]">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-bg)] px-[var(--sp-2)] py-[var(--sp-2)]">
            <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Oda zekâsı</p>
            <ul className="m-0 mt-2 list-none space-y-1.5 p-0 text-[11px] font-medium text-[var(--color-text-secondary)]">
              <li>{surface.intelligence.active_members_label}</li>
              <li>{surface.intelligence.heat_peak_label}</li>
              <li>{surface.intelligence.topic_overlap_label}</li>
              <li>{surface.intelligence.premium_participation_label}</li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-bg)] px-[var(--sp-2)] py-[var(--sp-2)]">
            <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Üst katılım</p>
            <ul className="m-0 mt-2 list-none space-y-1.5 p-0">
              {surface.top_participants.map((u) => (
                <li key={u.user_id} className="text-[11px] font-semibold text-[var(--color-text)]">
                  {u.display}
                  <span className="ml-1 text-[10px] font-medium text-[var(--color-meta)]">{u.score_label}</span>
                  {u.premium_member ? <span className="ml-1 text-[10px] text-[var(--color-primary-dark)]">· abone</span> : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-bg)] px-[var(--sp-2)] py-[var(--sp-2)]">
            <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Ağ</p>
            <ul className="m-0 mt-2 list-none space-y-1 p-0">
              {surface.network.map((n) => (
                <li key={n.id}>
                  <Link href={n.href} className="text-[11px] font-medium text-[var(--color-primary-dark)] hover:underline">
                    {n.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
