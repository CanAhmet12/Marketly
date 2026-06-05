"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { getCloseFriendsRepository } from "@/features/close-friends/repository";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { isMockDataEnabled } from "@/mock/config";

type Props = { circleId: string };

export function PrivateCircleDetailClient({ circleId }: Props) {
  const { user } = useAuth();
  const viewerId = user?.id ?? null;
  const pSnap = usePersonalizationSnapshot();
  const mockOn = isMockDataEnabled();

  const detail = useMemo(() => {
    void pSnap.recommendRev;
    void mockOn;
    return getCloseFriendsRepository().getCircleDetail(circleId, viewerId);
  }, [circleId, viewerId, pSnap.recommendRev, mockOn]);

  if (!detail) {
    return (
      <div className="ms-page-wrapper ms-container-standard py-10">
        <EmptyState
          title="Daire bulunamadı"
          description="Bağlantı süresi dolmuş veya davet kapsamı dışında olabilirsin."
          actionLabel="Özel daireler"
          actionHref="/close-friends"
          secondaryActionLabel="Keşfet"
          secondaryActionHref="/discover"
          tone="social"
        />
      </div>
    );
  }

  const { circle, feed, publishing_hint } = detail;

  return (
    <div className="ms-page-wrapper ms-container-standard pb-12 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
            {circle.avatar_url ? (
              <Image src={circle.avatar_url} alt={circle.creator_display} fill className="object-cover" sizes="56px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[16px] font-bold text-[var(--color-meta)]">
                {circle.creator_display.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Özel daire</p>
            <h1 className="mt-0.5 text-[18px] font-bold leading-tight text-[var(--color-text)]">{circle.title}</h1>
            <p className="text-[12px] font-medium text-[var(--color-meta)]">{circle.creator_handle}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded border border-[var(--ms-border-hairline)] px-1.5 py-px text-[10px] font-semibold text-[var(--color-text-secondary)]">{circle.access.label}</span>
              {circle.access.locked ? (
                <span className="rounded border border-[color-mix(in_srgb,var(--color-primary)_30%,var(--ms-border-hairline))] px-1.5 py-px text-[10px] font-semibold text-[var(--color-primary-dark)]">
                  Davetli
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={circle.subscription_href} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
            Üyelik
          </Link>
          <Link href={circle.rooms_href} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
            Odalar
          </Link>
          <Link href={circle.signals_href} className="rounded-full bg-[var(--color-text)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-surface)] hover:opacity-90">
            Sinyaller
          </Link>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-[13px] font-medium leading-relaxed text-[var(--color-text-secondary)]">{circle.subline}</p>

      <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Daire istihbaratı</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Üyeler", circle.intel.member_activity_label],
              ["Üretici", circle.intel.creator_participation_label],
              ["Özel etkileşim", circle.intel.private_engagement_label],
              ["Tartışma yoğunluğu", circle.intel.discussion_density_label],
              ["Premium katılım", circle.intel.premium_participation_label],
              ["Davet ivmesi", circle.intel.invite_momentum_label],
              ["Güven ısısı", circle.intel.trust_heat_label],
              ["Örtüşme", circle.intel.member_overlap_label],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="rounded border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-2 py-1.5">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{k}</dt>
              <dd className="mt-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-4 text-[11px] font-medium text-[var(--color-meta)]">{publishing_hint}</p>

      <section className="mt-6">
        <h2 className="text-[14px] font-bold text-[var(--color-text)]">Daire akışı</h2>
        {feed.length === 0 ? (
          <p className="mt-2 text-[12px] font-medium text-[var(--color-text-secondary)]">Henüz özel öğe yok.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--ms-border-hairline)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            {feed.map((row) => (
              <li key={row.id} className="px-3 py-2.5">
                {row.href ? (
                  <Link href={row.href} className="text-[12px] font-bold text-[var(--color-text)] hover:underline">
                    {row.title}
                  </Link>
                ) : (
                  <span className="text-[12px] font-bold text-[var(--color-text)]">{row.title}</span>
                )}
                <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">{row.sub}</p>
                {row.trust_line ? <p className="mt-1 text-[10px] font-semibold text-[var(--color-primary-dark)]">{row.trust_line}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-3 text-[12px] font-semibold">
        <Link href="/close-friends" className="text-[var(--color-primary-dark)] hover:underline">
          ← Özel daireler
        </Link>
        <Link href="/upload" className="text-[var(--color-text-secondary)] hover:underline">
          Yayınla
        </Link>
      </div>
    </div>
  );
}
