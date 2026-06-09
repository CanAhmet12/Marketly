"use client";

import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { HubHeroStrip } from "@/features/hub/components/hub-hero-strip";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";
import { SubscriptionsPageSkeleton } from "@/features/social/components/social-states";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { useSubscriptionsHub } from "@/features/subscriptions/hooks/use-subscriptions-hub";
import type { MembershipDiscoveryCard, MembershipTierKey } from "@/features/subscriptions/domain/types";
import { cn } from "@/lib/cn";

function HeatMicro({ score }: { score: number }) {
  const w = `${Math.round(Math.min(1, Math.max(0, score)) * 100)}%`;
  return (
    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,var(--color-border))]">
      <div className="h-full rounded-full bg-[color-mix(in_srgb,var(--color-primary)_55%,var(--color-text))]" style={{ width: w }} />
    </div>
  );
}

function TierChips({ keys }: { keys: readonly MembershipTierKey[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {keys.slice(0, 5).map((k) => (
        <span
          key={k}
          className="max-w-full truncate rounded border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]"
        >
          {k.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}

function CreatorCard({ c, dense }: { c: MembershipDiscoveryCard; dense?: boolean }) {
  return (
    <Link
      href={c.href_detail}
      className={cn(
        "social-hub-card group block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition hover:border-[color-mix(in_srgb,var(--color-primary)_35%,var(--color-border))] hover:bg-[var(--color-surface-hover)]",
        dense ? "p-2.5" : "p-3",
      )}
    >
      <div className="flex gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
          {c.avatar_url ? (
            <Image src={c.avatar_url} alt={c.display_name} fill className="object-cover" sizes="44px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[12px] font-bold text-[var(--color-meta)]">
              {c.display_name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="truncate text-[13px] font-bold text-[var(--color-text)]">{c.display_name}</span>
            {c.verified ? (
              <span className="shrink-0 text-[10px] font-semibold text-[var(--color-primary-dark)]">Doğrulanmış</span>
            ) : null}
          </div>
          <p className="truncate text-[11px] font-medium text-[var(--color-meta)]">{c.handle}</p>
          <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-snug text-[var(--color-text-secondary)]">{c.thesis_line}</p>
          <p className="mt-1 text-[10px] font-semibold text-[var(--color-primary-dark)]">{c.rel_label}</p>
          <TierChips keys={c.tier_keys} />
          <HeatMicro score={c.heat_score} />
        </div>
      </div>
      {[c.intel.subscriber_momentum_label, c.intel.premium_engagement_label, c.intel.consistency_label].some((v) => v.trim()) ? (
        <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-[var(--ms-border-hairline)] pt-2 text-[10px] font-medium text-[var(--color-text-secondary)]">
          {c.intel.subscriber_momentum_label.trim() ? (
            <div>
              <dt className="text-[var(--color-meta)]">Takipçi</dt>
              <dd className="truncate">{c.intel.subscriber_momentum_label}</dd>
            </div>
          ) : null}
          {c.intel.premium_engagement_label.trim() ? (
            <div>
              <dt className="text-[var(--color-meta)]">İçerik</dt>
              <dd className="truncate">{c.intel.premium_engagement_label}</dd>
            </div>
          ) : null}
          {c.intel.consistency_label.trim() ? (
            <div>
              <dt className="text-[var(--color-meta)]">Son aktivite</dt>
              <dd className="truncate">{c.intel.consistency_label}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </Link>
  );
}

function Rail({
  title,
  sub,
  cards,
}: {
  title: string;
  sub?: string;
  cards: MembershipDiscoveryCard[];
}) {
  if (cards.length === 0) return null;
  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-col gap-0.5">
        <h2 className="text-[14px] font-bold tracking-tight text-[var(--color-text)]">{title}</h2>
        {sub ? <p className="text-[11px] font-medium text-[var(--color-meta)]">{sub}</p> : null}
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:thin]">
        {cards.map((c) => (
          <div key={c.creator_id} className="w-[min(100%,18rem)] shrink-0 px-1">
            <CreatorCard c={c} dense />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SubscriptionsHubClient() {
  const { user, isInitialized } = useAuth();
  const viewerId = user?.id ?? null;
  const pSnap = usePersonalizationSnapshot();
  /** İlk istemci karesi SSR ile aynı olmalı; `getSubscriptionsHub` repo’dan doğrudan okur (snapshot dışı). */
  void pSnap.recommendRev;
  void pSnap.feedbackRev;
  void pSnap.adaptiveRev;
  void pSnap.explorationRev;
  void pSnap.affinity.meta.eventCount;

  const { payload, isLoading: hubLoading } = useSubscriptionsHub(viewerId);

  const emptyHub = payload.data_mode === "live_sparse" && payload.catalog.length === 0;

  const pageHeader = (
    <HubPageHeader
      kicker={hubPremiumKicker("connect", "Üyelikler")}
      title={payload.headline}
      subtitle={payload.subline}
    />
  );

  const heroStrip = (
    <HubHeroStrip
      stats={[
        {
          label: "Aktif üyelik",
          value: payload.active_memberships.length,
          valueAccent: payload.active_memberships.length > 0,
        },
        {
          label: "Strateji profili",
          value: payload.strategy_profile_label,
        },
      ]}
    />
  );

  if (!isInitialized || hubLoading) {
    return (
      <HubPageShell zone="connect" className="sub-hub-page" header={pageHeader}>
        <SubscriptionsPageSkeleton />
      </HubPageShell>
    );
  }

  return (
    <HubPageShell zone="connect" className="sub-hub-page" header={pageHeader} hero={heroStrip}>
      <p className="text-[12px] font-medium text-[var(--color-meta)]">{payload.affinity_line}</p>
      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
        <span className="rounded-full border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2.5 py-1 text-[var(--color-text-secondary)]">
          Strateji profili: {payload.strategy_profile_label}
        </span>
        {payload.cold_start ? (
          <span className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_25%,var(--ms-border-hairline))] px-2.5 py-1 text-[var(--color-primary-dark)]">
            Soğuk başlangıç — etkileşimle kişiselleşir
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={payload.nav.signals}
          className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
        >
          Sinyaller
        </Link>
        <Link
          href={payload.nav.discover}
          className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
        >
          Keşfet
        </Link>
        <Link
          href={payload.nav.watch}
          className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
        >
          İzle
        </Link>
        <Link
          href={payload.nav.markets}
          className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
        >
          Piyasalar
        </Link>
        <Link
          href="/hub/close-friends"
          className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
        >
          Özel daireler
        </Link>
      </div>

      {payload.active_memberships.length > 0 ? (
        <section className="sub-hub-active rounded-[var(--radius-lg)] border p-4">
          <h2 className="sub-hub-rail-title text-[13px] text-[var(--color-text)]">Aktif üyeliklerin</h2>
          <ul className="mt-3 divide-y divide-[var(--ms-border-hairline)]">
            {payload.active_memberships.map((m) => (
              <li key={m.creator_id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[var(--color-text)]">{m.display_name}</p>
                  <p className="text-[11px] font-medium text-[var(--color-meta)]">
                    {m.handle} · {m.tier_label}
                    {m.renew_hint ? <span className="text-[var(--color-text-secondary)]"> · {m.renew_hint}</span> : null}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={m.href_detail} className="text-[12px] font-semibold text-[var(--color-primary-dark)] hover:underline">
                    Plan
                  </Link>
                  <Link href={m.href_channel} className="text-[12px] font-semibold text-[var(--color-text-secondary)] hover:underline">
                    Kanal
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="sub-hub-empty rounded-[var(--radius-lg)] border border-dashed bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] px-4 py-3 text-[12px] font-medium text-[var(--color-text-secondary)]">
          Henüz aktif üyeliğin yok. Aşağıdaki önerilerden bir üreticinin planına girerek kilitleri görebilirsin.
        </div>
      )}

      <section className="sub-hub-intel rounded-[var(--radius-lg)] border p-4">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Platform özeti</h2>
        <ul className="mt-2 space-y-1.5 text-[12px] font-medium leading-snug text-[var(--color-text-secondary)]">
          <li>{payload.platform_intel.premium_circulation_label}</li>
          <li>{payload.platform_intel.room_desk_label}</li>
          <li>{payload.platform_intel.signal_archive_label}</li>
        </ul>
      </section>

      {emptyHub ? (
        <div className="mt-10">
          <EmptyState
            title="Üyelik kataloğu hazırlanıyor"
            description="Canlı modda öneriler ve üretici paketleri sunucuya bağlandığında burada görünecek. Şimdilik keşif ve sinyaller üzerinden ilerleyebilirsin."
          />
        </div>
      ) : (
        <>
          <Rail title="Sana önerilen üyelikler" sub="İlgi grafiği, portföy ve izleme listesiyle hizalanmış" cards={payload.rails.recommended_for_you} />
          <Rail title="Yükselen premium üreticiler" cards={payload.rails.rising_premium} />
          <Rail title="Kurumsal tempo" sub="Derinlik ve risk çerçevesi arayanlar için" cards={payload.rails.institutional_style} />
          <Rail title="Strateji & sinyal masası" cards={payload.rails.strategy_focused} />
          <Rail title="Portföyünle ilişkili" cards={payload.rails.portfolio_aligned} />
          <Rail title="Premium oda keşfi" cards={payload.rails.premium_room_spotlight} />
          <Rail title="Makro masa" cards={payload.rails.macro_desk} />
          <Rail title="Yüksek isabet profili" cards={payload.rails.high_conviction} />

          <section className="mt-10">
            <h2 className="sub-hub-rail-title text-[14px] text-[var(--color-text)]">Tüm üretici üyelikleri</h2>
            <p className="mt-1 text-[11px] font-medium text-[var(--color-meta)]">Kompakt kartlar — taşma yok, yatay kaydırma yok</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {payload.catalog.map((c) => (
                <CreatorCard key={c.creator_id} c={c} />
              ))}
            </div>
          </section>
        </>
      )}
    </HubPageShell>
  );
}
