"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { MembershipDetailHeader } from "@/features/subscriptions/components/membership-detail-header";
import { MembershipPreviewColumns } from "@/features/subscriptions/components/membership-preview-columns";
import { MembershipSubscribeActions } from "@/features/subscriptions/components/membership-subscribe-actions";
import { MembershipTierTable } from "@/features/subscriptions/components/membership-tier-table";
import { SubscriptionsDataBadge } from "@/features/subscriptions/components/subscriptions-data-badge";
import { SubscriptionsPageHeader } from "@/features/subscriptions/components/subscriptions-page-header";
import {
  MembershipDetailSkeleton,
  SubscriptionsHubError,
} from "@/features/subscriptions/components/subscriptions-states";
import { SubscriptionsSectionHeader } from "@/features/subscriptions/components/subscriptions-ui";
import { useMembershipDetail } from "@/features/subscriptions/hooks/use-subscriptions-hub";
import type { CreatorEconomyIntel } from "@/features/subscriptions/domain/types";

function IntelGrid({ intel }: { intel: CreatorEconomyIntel }) {
  const rows = (
    [
      ["Takipçi", intel.subscriber_momentum_label],
      ["İçerik yoğunluğu", intel.premium_engagement_label],
      ["Son aktivite", intel.consistency_label],
      ["Aktif çağrılar", intel.premium_hit_rate_label],
      ["Strateji kalitesi", intel.strategy_quality_label],
      ["Aktivite ısısı", intel.premium_activity_heat_label],
    ] as const
  ).filter(([, v]) => v.trim().length > 0);

  if (rows.length === 0) return null;

  return (
    <section>
      <SubscriptionsSectionHeader title="Üretici aktivitesi" />
      <dl className="sub-stat-grid">
        {rows.map(([label, value]) => (
          <div key={label} className="sub-stat">
            <dt className="sub-stat-label">{label}</dt>
            <dd className="sub-stat-value">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type Props = { creatorId: string };

export function MembershipDetailClient({ creatorId }: Props) {
  const { user } = useAuth();
  const viewerId = user?.id ?? null;
  const pSnap = usePersonalizationSnapshot();
  void pSnap.recommendRev;

  const { detail, isLoading, isError, refetch, mockOn } = useMembershipDetail(creatorId, viewerId);

  const pageHeader = <SubscriptionsPageHeader title="Üyelik detayı" />;

  if (isLoading) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-subscriptions" header={pageHeader}>
        <MembershipDetailSkeleton />
      </HubPageShell>
    );
  }

  if (isError) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-subscriptions" header={pageHeader}>
        <SubscriptionsHubError onRetry={() => void refetch()} />
      </HubPageShell>
    );
  }

  if (!detail) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-subscriptions" header={pageHeader}>
        <div className="sub-studio">
          <div className="sub-page sub-surface">
            <div className="sub-panel">
              <EmptyState
                title="Üyelik bulunamadı"
                description="Bu üretici için kayıt yok veya profil gizli. Keşfet üzerinden başka bir üretici seçebilirsin."
                actionLabel="Üyelik merkezi"
                actionHref="/hub/subscriptions"
                secondaryActionLabel="Keşfet"
                secondaryActionHref="/discover"
                tone="social"
              />
            </div>
          </div>
        </div>
      </HubPageShell>
    );
  }

  return (
    <HubPageShell zone="connect" className="hp-canvas--embedded-subscriptions" header={pageHeader}>
      <div className="sub-studio">
        <div className="sub-page sub-surface">
          <div className="sub-panel">
            <MembershipDetailHeader detail={detail} />

            <SubscriptionsDataBadge
              dataMode={mockOn ? "mock" : "live"}
              writeEnabled={detail.write_enabled}
              mockOn={mockOn}
            />

            <MembershipSubscribeActions detail={detail} />

            <div>
              <p className="sub-detail-overview">{detail.overview}</p>
              <p className="sub-detail-strategy" style={{ marginTop: 8 }}>
                Strateji odağı · {detail.strategy_summary}
              </p>
            </div>

            <IntelGrid intel={detail.intel} />

            <section>
              <SubscriptionsSectionHeader title="Kilitler" desc="Bu üreticinin premium katmanlarında açılan erişimler" />
              <ul className="sub-unlocks-list">
                {detail.unlocks_editorial.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </section>

            <section>
              <SubscriptionsSectionHeader title="Üyelik kademeleri" />
              <MembershipTierTable tiers={detail.tiers} />
            </section>

            <MembershipPreviewColumns
              room_previews={detail.room_previews}
              discussion_previews={detail.discussion_previews}
              signal_previews={detail.signal_previews}
            />

            <section>
              <SubscriptionsSectionHeader title="Aktivite zaman çizelgesi" />
              {detail.activity_timeline.length === 0 ? (
                <p className="sub-empty-hint">Zaman çizelgesi boş.</p>
              ) : (
                <ul className="sub-timeline">
                  {detail.activity_timeline.map((a) => (
                    <li key={a.id} className="sub-timeline-row">
                      <span className="sub-timeline-date">{a.at.slice(0, 10)}</span>
                      <div className="min-w-0">
                        {a.href ? (
                          <Link href={a.href} className="sub-timeline-link">
                            {a.title}
                          </Link>
                        ) : (
                          <span className="sub-timeline-link">{a.title}</span>
                        )}
                        <p className="sub-preview-item-meta">{a.sub}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="sub-empty-hint" style={{ marginTop: 12 }}>
                {detail.archive_hint}
              </p>
            </section>

            <nav className="sub-quick-links" aria-label="Geri dön">
              <Link href="/hub/subscriptions" className="sub-quick-link">
                ← Üyelik merkezi
              </Link>
              <Link href="/hub/close-friends" className="sub-quick-link">
                Özel daireler
              </Link>
              <Link href={detail.links.discover} className="sub-quick-link">
                Keşfet
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </HubPageShell>
  );
}
