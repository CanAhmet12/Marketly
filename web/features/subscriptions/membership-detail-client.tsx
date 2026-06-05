"use client";

import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { useMembershipDetail } from "@/features/subscriptions/hooks/use-subscriptions-hub";
import { MembershipDetailSkeleton } from "@/features/social/components/social-states";
import type { MembershipTierDefinition } from "@/features/subscriptions/domain/types";
import { cn } from "@/lib/cn";

function AccessGrid({ tier }: { tier: MembershipTierDefinition }) {
  const rows: { k: keyof MembershipTierDefinition["access"]; label: string }[] = [
    { k: "rooms", label: "Odalar" },
    { k: "signals", label: "Sinyaller" },
    { k: "discussions", label: "Tartışmalar" },
    { k: "watchlists", label: "İzleme" },
    { k: "live", label: "Canlı" },
    { k: "research", label: "Araştırma" },
    { k: "archives", label: "Arşiv" },
    { k: "notes", label: "Notlar" },
  ];
  return (
    <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
      {rows.map((r) => (
        <div key={r.k} className="rounded border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-2 py-1">
          <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{r.label}</p>
          <p className="text-[10px] font-semibold capitalize text-[var(--color-text-secondary)]">{tier.access[r.k]}</p>
        </div>
      ))}
    </div>
  );
}

type Props = { creatorId: string };

export function MembershipDetailClient({ creatorId }: Props) {
  const { user } = useAuth();
  const viewerId = user?.id ?? null;
  const pSnap = usePersonalizationSnapshot();
  void pSnap.recommendRev;

  const { detail, isLoading } = useMembershipDetail(creatorId, viewerId);

  if (isLoading) {
    return <MembershipDetailSkeleton />;
  }

  if (!detail) {
    return (
      <div className="ms-page-wrapper ms-container-standard py-10">
        <EmptyState
          title="Üyelik bulunamadı"
          description="Bu üretici için yerel katalogda kayıt yok veya profil gizli. Keşfet üzerinden başka bir üretici seçebilirsin."
          actionLabel="Üyelik merkezi"
          actionHref="/subscriptions"
          secondaryActionLabel="Keşfet"
          secondaryActionHref="/discover"
          tone="social"
        />
      </div>
    );
  }

  return (
    <div className="ms-page-wrapper ms-container-standard pb-12 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
            {detail.avatar_url ? (
              <Image src={detail.avatar_url} alt={detail.display_name} fill className="object-cover" sizes="64px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[18px] font-bold text-[var(--color-meta)]">
                {detail.display_name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Üyelik özeti</p>
            <h1 className="mt-0.5 truncate text-[20px] font-bold text-[var(--color-text)]">{detail.display_name}</h1>
            <p className="text-[12px] font-medium text-[var(--color-meta)]">{detail.handle}</p>
            {detail.verified ? (
              <span className="mt-1 inline-block text-[10px] font-semibold text-[var(--color-primary-dark)]">Doğrulanmış üretici</span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={detail.links.channel}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          >
            Kanal
          </Link>
          <Link
            href={detail.links.rooms_tab}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          >
            Odalar
          </Link>
          <Link
            href={detail.links.signals}
            className="rounded-full bg-[var(--color-text)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-surface)] hover:opacity-90"
          >
            Sinyaller
          </Link>
        </div>
      </div>

      <p className="mt-5 max-w-3xl text-[13px] font-medium leading-relaxed text-[var(--color-text-secondary)]">{detail.overview}</p>
      <p className="mt-2 text-[12px] font-semibold text-[var(--color-text)]">Strateji odağı · {detail.strategy_summary}</p>

      {(
        [
          ["Takipçi", detail.intel.subscriber_momentum_label],
          ["İçerik yoğunluğu", detail.intel.premium_engagement_label],
          ["Son aktivite", detail.intel.consistency_label],
          ["Aktif çağrılar", detail.intel.premium_hit_rate_label],
          ["Strateji kalitesi", detail.intel.strategy_quality_label],
          ["Aktivite ısısı", detail.intel.premium_activity_heat_label],
        ] as const
      ).some(([, v]) => v.trim().length > 0) ? (
        <section className="mt-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Üretici aktivitesi</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["Takipçi", detail.intel.subscriber_momentum_label],
                ["İçerik yoğunluğu", detail.intel.premium_engagement_label],
                ["Son aktivite", detail.intel.consistency_label],
                ["Aktif çağrılar", detail.intel.premium_hit_rate_label],
                ["Strateji kalitesi", detail.intel.strategy_quality_label],
                ["Aktivite ısısı", detail.intel.premium_activity_heat_label],
              ] as const
            )
              .filter(([, v]) => v.trim().length > 0)
              .map(([k, v]) => (
                <div key={k} className="rounded border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-2.5 py-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{k}</dt>
                  <dd className="mt-1 text-[11px] font-semibold leading-snug text-[var(--color-text-secondary)]">{v}</dd>
                </div>
              ))}
          </dl>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-[14px] font-bold text-[var(--color-text)]">Kilitler</h2>
        <ul className="mt-2 space-y-1.5 text-[12px] font-medium text-[var(--color-text-secondary)]">
          {detail.unlocks_editorial.map((line, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-[var(--color-primary-dark)]">·</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-[14px] font-bold text-[var(--color-text)]">Üyelik kademeleri</h2>
        <div className="mt-4 space-y-4">
          {detail.tiers.map((tier) => (
            <div
              key={tier.key}
              className={cn(
                "rounded-[var(--radius-lg)] border p-4",
                tier.highlight
                  ? "border-[color-mix(in_srgb,var(--color-primary)_40%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-primary)_5%,var(--color-surface))]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[13px] font-bold text-[var(--color-text)]">{tier.label}</h3>
                {tier.monthly_hint ? <span className="text-[11px] font-semibold text-[var(--color-meta)]">{tier.monthly_hint}</span> : null}
              </div>
              <p className="mt-1 text-[12px] font-medium leading-snug text-[var(--color-text-secondary)]">{tier.pitch}</p>
              <AccessGrid tier={tier} />
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Oda önizleme</h3>
          {detail.room_previews.length === 0 ? (
            <p className="mt-2 text-[12px] font-medium text-[var(--color-text-secondary)]">Önizlenecek oda yok.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {detail.room_previews.map((r) => (
                <li key={r.id}>
                  <Link href={r.href} className="block rounded-md border border-transparent px-0 py-1 transition hover:border-[var(--ms-border-hairline)] hover:bg-[var(--color-surface-hover)]">
                    <p className="text-[12px] font-bold text-[var(--color-text)]">{r.label}</p>
                    <p className="text-[10px] font-medium text-[var(--color-meta)]">
                      {r.kind_label}
                      {r.premium ? <span className="text-[var(--color-primary-dark)]"> · premium</span> : null} · {r.heat_label}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Tartışma & thread</h3>
          {detail.discussion_previews.length === 0 ? (
            <p className="mt-2 text-[12px] font-medium text-[var(--color-text-secondary)]">Önizleme yok.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {detail.discussion_previews.map((d) => (
                <li key={d.id}>
                  <Link href={d.href} className="block text-[12px] font-semibold leading-snug text-[var(--color-text)] hover:underline">
                    {d.label}
                  </Link>
                  <p className="text-[11px] font-medium text-[var(--color-meta)]">{d.sub}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Sinyal önizleme</h3>
          {detail.signal_previews.length === 0 ? (
            <p className="mt-2 text-[12px] font-medium text-[var(--color-text-secondary)]">Açık çağrı yok — kanal sinyal sekmesine git.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {detail.signal_previews.map((s) => (
                <li key={s.id}>
                  <Link href={s.href} className="text-[12px] font-bold text-[var(--color-text)] hover:underline">
                    {s.symbol} · {s.direction}
                  </Link>
                  <p className="text-[10px] font-semibold text-[var(--color-primary-dark)]">{s.access_label}</p>
                  <p className="text-[11px] font-medium leading-snug text-[var(--color-text-secondary)]">{s.thesis_snippet}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-8 rounded-[var(--radius-lg)] border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] p-4">
        <h3 className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Aktivite zaman çizelgesi</h3>
        {detail.activity_timeline.length === 0 ? (
          <p className="mt-2 text-[12px] font-medium text-[var(--color-text-secondary)]">Zaman çizelgesi boş.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {detail.activity_timeline.map((a) => (
              <li key={a.id} className="flex gap-3 text-[12px]">
                <span className="w-24 shrink-0 font-mono text-[10px] font-medium text-[var(--color-meta)]">{a.at.slice(0, 10)}</span>
                <div className="min-w-0">
                  {a.href ? (
                    <Link href={a.href} className="font-semibold text-[var(--color-text)] hover:underline">
                      {a.title}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[var(--color-text)]">{a.title}</span>
                  )}
                  <p className="text-[11px] font-medium text-[var(--color-text-secondary)]">{a.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] font-medium text-[var(--color-meta)]">{detail.archive_hint}</p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3 text-[12px] font-semibold">
        <Link href="/subscriptions" className="text-[var(--color-primary-dark)] hover:underline">
          ← Üyelik merkezi
        </Link>
        <Link href="/close-friends" className="text-[var(--color-text-secondary)] hover:underline">
          Özel daireler
        </Link>
        <Link href={detail.links.discover} className="text-[var(--color-text-secondary)] hover:underline">
          Keşfet
        </Link>
      </div>
    </div>
  );
}
