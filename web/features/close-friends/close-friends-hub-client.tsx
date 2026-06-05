"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { CloseFriendsPageSkeleton } from "@/features/social/components/social-states";
import { getCloseFriendsRepository } from "@/features/close-friends/repository";
import type { PrivateCircleSummary } from "@/features/close-friends/domain/types";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

function CircleCard({ c, dense }: { c: PrivateCircleSummary; dense?: boolean }) {
  return (
    <Link
      href={c.href}
      className={cn(
        "social-hub-card block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))] hover:bg-[var(--color-surface-hover)]",
        dense ? "p-2.5" : "p-3",
      )}
    >
      <div className="flex gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
          {c.avatar_url ? (
            <Image src={c.avatar_url} alt={c.creator_display} fill className="object-cover" sizes="44px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[12px] font-bold text-[var(--color-meta)]">
              {c.creator_display.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-bold text-[var(--color-text)]">{c.title}</p>
          <p className="truncate text-[11px] font-medium text-[var(--color-meta)]">{c.subline}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="max-w-full truncate rounded border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              {c.access.label}
            </span>
            {c.access.locked ? (
              <span className="rounded border border-[color-mix(in_srgb,var(--color-primary)_28%,var(--ms-border-hairline))] px-1.5 py-px text-[10px] font-semibold text-[var(--color-primary-dark)]">
                Kilitli
              </span>
            ) : null}
            {c.access.role_hint ? (
              <span className="rounded border border-[var(--ms-border-hairline)] px-1.5 py-px text-[10px] font-semibold text-[var(--color-meta)]">{c.access.role_hint}</span>
            ) : null}
          </div>
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-1 border-t border-[var(--ms-border-hairline)] pt-2 text-[10px] font-medium text-[var(--color-text-secondary)]">
        <div>
          <dt className="text-[var(--color-meta)]">Güven</dt>
          <dd className="truncate">{c.intel.trust_heat_label}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-meta)]">Üyeler</dt>
          <dd className="truncate">{c.intel.member_activity_label}</dd>
        </div>
      </dl>
    </Link>
  );
}

function Rail({ title, sub, circles }: { title: string; sub?: string; circles: PrivateCircleSummary[] }) {
  if (circles.length === 0) return null;
  return (
    <section className="mt-8">
      <div className="mb-3">
        <h2 className="text-[14px] font-bold text-[var(--color-text)]">{title}</h2>
        {sub ? <p className="text-[11px] font-medium text-[var(--color-meta)]">{sub}</p> : null}
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {circles.map((c) => (
          <div key={c.id} className="w-[min(100%,17rem)] shrink-0 px-1">
            <CircleCard c={c} dense />
          </div>
        ))}
      </div>
    </section>
  );
}

export function CloseFriendsHubClient() {
  const { user, isInitialized } = useAuth();
  const viewerId = user?.id ?? null;
  const pSnap = usePersonalizationSnapshot();
  const mockOn = isMockDataEnabled();

  const payload = useMemo(() => {
    void pSnap.recommendRev;
    void pSnap.affinity.meta.eventCount;
    void mockOn;
    return getCloseFriendsRepository().getPrivateCirclesHub(viewerId);
  }, [viewerId, pSnap.recommendRev, pSnap.affinity.meta.eventCount, mockOn]);

  if (!isInitialized) return <CloseFriendsPageSkeleton />;
  if (!user) {
    return (
      <div className="ms-page-wrapper ms-container-standard py-8">
        <EmptyState
          title="Oturum gerekli"
          description="Özel daireler ve güven katmanı yalnızca oturum açmış üyeler için görünür."
          actionLabel="Oturum aç"
          actionHref={`/auth/login?next=${encodeURIComponent("/close-friends")}`}
          tone="social"
          compact
        />
      </div>
    );
  }

  const sparse = payload.data_mode === "live_sparse" && payload.your_circles.length === 0 && payload.suggested_circles.length === 0;

  return (
    <div className="ms-page-wrapper ms-container-standard pb-12 pt-6">
      <header className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Private network</p>
        <h1 className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-[var(--color-text)]">{payload.headline}</h1>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--color-text-secondary)]">{payload.subline}</p>
        <p className="mt-2 text-[12px] font-medium text-[var(--color-meta)]">{payload.affinity_line}</p>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={payload.nav.subscriptions} className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
          Üyelikler
        </Link>
        <Link href={payload.nav.messages} className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
          Mesajlar
        </Link>
        <Link href={payload.nav.notifications} className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
          Bildirimler
        </Link>
        <Link href={payload.nav.discover} className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
          Keşfet
        </Link>
        <Link href={payload.nav.watch} className="social-hub-pill rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
          İzle
        </Link>
        <Link href={payload.publishing.upload_href} className="social-hub-pill rounded-full bg-[var(--color-text)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-surface)] hover:opacity-90">
          Yayınla
        </Link>
      </div>

      <p className="mt-4 max-w-2xl rounded-[var(--radius-lg)] border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] px-3 py-2 text-[11px] font-medium text-[var(--color-text-secondary)]">
        {payload.publishing.composer_hint}
      </p>

      {payload.trusted_members.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-[14px] font-bold text-[var(--color-text)]">Güvenilen katman</h2>
          <p className="mt-1 text-[11px] font-medium text-[var(--color-meta)]">Yakın takip — özel yayın ve dar daire için çekirdek liste</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {payload.trusted_members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                  {m.avatar_url ? (
                    <Image src={m.avatar_url} alt={m.full_name ?? m.username} fill className="object-cover" sizes="40px" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[12px] font-bold text-[var(--color-meta)]">
                      {(m.full_name ?? m.username).slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-[var(--color-text)]">{m.full_name ?? m.username}</p>
                  <p className="truncate text-[11px] font-medium text-[var(--color-meta)]">@{m.username}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[var(--color-primary-dark)]">{m.trust_line}</p>
                </div>
                <Link href={m.channel_href} className="shrink-0 text-[11px] font-bold text-[var(--color-text-secondary)] hover:underline">
                  Kanal
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] px-3 py-2 text-[12px] font-medium text-[var(--color-text-secondary)]">
          Yakın takip listen boş.{" "}
          <Link href="/settings" className="font-bold text-[var(--color-primary-dark)] hover:underline">
            Ayarlardan
          </Link>{" "}
          çekirdek üreticilerini ekleyebilirsin.
        </div>
      )}

      {sparse ? (
        <div className="mt-8">
          <EmptyState title="Özel daireler hazırlanıyor" description="Canlı veri modunda davetli masalar ve kitle segmentasyonu bağlandığında burada görünecek." />
        </div>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="text-[14px] font-bold text-[var(--color-text)]">Senin dairelerin</h2>
            <p className="mt-1 text-[11px] font-medium text-[var(--color-meta)]">Yakın takip üreticilerinin özel segmentleri</p>
            {payload.your_circles.length === 0 ? (
              <p className="mt-2 text-[12px] font-medium text-[var(--color-text-secondary)]">Henüz atanmış daire yok.</p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {payload.your_circles.map((c) => (
                  <CircleCard key={c.id} c={c} />
                ))}
              </div>
            )}
          </section>

          <Rail title="Önerilen özel topluluklar" sub="İlgi grafiği + üyelik davranışı" circles={payload.suggested_circles} />
          <Rail title="Güvenilir gruplar" circles={payload.rails.trusted_groups} />
          <Rail title="Premium iç çember" circles={payload.rails.premium_inner} />
          <Rail title="Portföyle ilişkili daireler" circles={payload.rails.portfolio_related} />
          <Rail title="Strateji uyumu" circles={payload.rails.strategy_fit} />
          <Rail title="Makro & özel masa" circles={payload.rails.macro_private} />
          <Rail title="Aktif özel topluluklar" circles={payload.rails.active_communities} />

          <section className="mt-10">
            <h2 className="text-[14px] font-bold text-[var(--color-text)]">Özel akış</h2>
            <p className="mt-1 text-[11px] font-medium text-[var(--color-meta)]">Daire içi güncellemeler — kompakt özet</p>
            {payload.private_feed.length === 0 ? (
              <p className="mt-2 text-[12px] font-medium text-[var(--color-text-secondary)]">Özel akışta öğe yok.</p>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--ms-border-hairline)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                {payload.private_feed.map((row) => (
                  <li key={row.id} className="px-3 py-2.5">
                    {row.href ? (
                      <Link href={row.href} className="text-[12px] font-bold text-[var(--color-text)] hover:underline">
                        {row.title}
                      </Link>
                    ) : (
                      <span className="text-[12px] font-bold text-[var(--color-text)]">{row.title}</span>
                    )}
                    <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">{row.sub}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-semibold text-[var(--color-meta)]">
                      <span>{row.kind.replace(/_/g, " ")}</span>
                      {row.trust_line ? <span className="text-[var(--color-primary-dark)]">{row.trust_line}</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <Link href="/settings" className="mt-8 inline-block text-[13px] font-bold text-[var(--color-primary-dark)] hover:underline">
        ← Ayarlar
      </Link>
    </div>
  );
}
