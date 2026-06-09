"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { StudioEconomyMembersPanel } from "@/features/studio/components/studio-economy-members-panel";
import { StudioEconomyRevenueDonut } from "@/features/studio/components/studio-economy-revenue-donut";
import { StudioEconomyRevenueHero } from "@/features/studio/components/studio-economy-revenue-hero";
import { StudioEconomyTierPanel } from "@/features/studio/components/studio-economy-tier-panel";
import { StudioSubpageSkeleton } from "@/features/studio/components/studio-states";
import { fetchStudioEconomySnapshot } from "@/features/studio/fetch-studio-economy";
import {
  audienceIntelRows,
  buildMockRevenueSnapshot,
  formatRevenueUsd,
  mergeEconomyWithSnapshot,
  SIGNAL_ACCESS_LABEL,
} from "@/features/studio/lib/studio-economy-insights";
import { getStudioRepository } from "@/features/studio/repository";
import type { StudioEconomyPublishingDefaults } from "@/features/studio/repository/types";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

const PUBLISH_LABELS: Record<keyof StudioEconomyPublishingDefaults, string> = {
  premium_default: "Premium varsayılan",
  room_target: "Oda hedefi",
  circle_target: "Daire hedefi",
  signal_visibility: "Sinyal görünürlüğü",
  discussion_visibility: "Tartışma görünürlüğü",
  recommendation_visibility: "Öneri görünürlüğü",
  archive_behavior: "Arşiv davranışı",
  preview_generation: "Önizleme üretimi",
};

export function StudioEconomyHubClient() {
  const { user } = useAuth();
  const ownerId = useStudioOwnerId(user);
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const liveQuery = useQuery({
    queryKey: queryKeys.studioEconomy(ownerId),
    queryFn: () => fetchStudioEconomySnapshot(getSupabaseBrowserClient(), ownerId!),
    enabled: liveMode && Boolean(ownerId),
    staleTime: 60_000,
  });

  const hub = useMemo(() => {
    if (!ownerId) return null;
    const base = getStudioRepository().getCreatorEconomyHub(ownerId);
    const snapshot = liveMode
      ? (liveQuery.data ?? buildMockRevenueSnapshot(ownerId, base))
      : buildMockRevenueSnapshot(ownerId, base);
    return mergeEconomyWithSnapshot(base, snapshot);
  }, [ownerId, liveMode, liveQuery.data]);

  if (!ownerId) {
    return (
      <EmptyState
        title="Giriş gerekli"
        description="Studio ekonomi verisi için oturum açın."
        tone="social"
        compact
      />
    );
  }

  if (liveMode && liveQuery.isLoading && !hub) {
    return <StudioSubpageSkeleton />;
  }

  if (liveMode && liveQuery.isError && !hub) {
    return (
      <EmptyState
        title="Ekonomi verisi yüklenemedi"
        description="Gelir özeti alınamadı. Bağlantınızı kontrol edin."
        actionLabel="Yenile"
        onAction={() => void liveQuery.refetch()}
        tone="social"
        compact
      />
    );
  }

  if (!hub?.revenue_snapshot) {
    return <StudioSubpageSkeleton />;
  }

  const snapshot = hub.revenue_snapshot;
  const audienceRows = audienceIntelRows(hub);
  const manageHref = hub.creator_id ? `/subscriptions/${encodeURIComponent(hub.creator_id)}` : null;

  return (
    <div className="st-dash-stack">
      <StudioEconomyRevenueHero hub={hub} snapshot={snapshot} />

      <div className="st-economy-main-grid">
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">Gelir Kaynakları</div>
          </div>
          {snapshot.segments.length === 0 ? (
            <div className="st-analytics-empty">
              Gelir dağılımı için abonelik veya monetize içerik gerekir.
            </div>
          ) : (
            <div className="st-donut-row">
              <StudioEconomyRevenueDonut segments={snapshot.segments} />
              <div className="st-donut-legend">
                {snapshot.segments.map((s) => (
                  <div key={s.label} className="st-legend-item">
                    <div className="st-legend-dot" style={{ background: s.color }} />
                    <span className="st-legend-label">{s.label}</span>
                    <span className="st-legend-val">
                      %{s.pct} · {formatRevenueUsd(s.amountUsd)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <StudioEconomyMembersPanel members={hub.members} />
      </div>

      <StudioEconomyTierPanel tiers={hub.tiers} manageHref={manageHref} />

      {audienceRows.length > 0 ? (
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">Kitle İstihbaratı</div>
          </div>
          <div className="st-economy-intel-grid">
            {audienceRows.map((row) => (
              <div key={row.label} className="st-economy-intel-item">
                <span className="st-economy-intel-label">{row.label}</span>
                <span className="st-economy-intel-value">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="st-economy-churn-hint">{hub.audience.churn_hint}</p>
        </div>
      ) : null}

      {hub.signal_controls.length > 0 ? (
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">Sinyal Erişim Konfigürasyonu</div>
            <Link href="/signals" className="st-block-link">
              Sinyaller →
            </Link>
          </div>
          <div className="st-economy-signal-grid">
            {hub.signal_controls.map((s) => (
              <Link key={s.id} href={s.href} className="st-economy-signal-card">
                <div className="st-economy-signal-symbol">{s.symbol}</div>
                {s.bundle_label ? <div className="st-economy-signal-bundle">{s.bundle_label}</div> : null}
                {s.audience_hint ? <p className="st-economy-signal-hint">{s.audience_hint}</p> : null}
                <span
                  className={cn(
                    "st-economy-signal-mode",
                    s.access_mode === "public" && "st-economy-signal-mode--public",
                    s.access_mode !== "public" && "st-economy-signal-mode--locked",
                  )}
                >
                  {SIGNAL_ACCESS_LABEL[s.access_mode] ?? s.access_mode}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {hub.room_controls.length > 0 ? (
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">Oda & Topluluk Kontrolleri</div>
          </div>
          <div className="st-economy-room-grid">
            {hub.room_controls.map((room) => (
              <Link key={room.id} href={room.href} className="st-economy-room-card">
                <div className="st-economy-room-label">{room.label}</div>
                <div className="st-economy-room-meta">
                  {room.premium ? "Premium" : "Topluluk"} · {room.invite_flow}
                </div>
                <div className="st-economy-room-sub">{room.moderation_label}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="st-block">
        <div className="st-block-header">
          <div className="st-block-title">Yayın Varsayılanları</div>
        </div>
        <div className="st-economy-publishing-grid">
          {(Object.entries(hub.publishing_defaults) as [keyof StudioEconomyPublishingDefaults, string][]).map(
            ([key, value]) => (
            <div key={key} className="st-economy-publish-item">
              <span className="st-economy-publish-label">{PUBLISH_LABELS[key]}</span>
              <span className="st-economy-publish-value">{value}</span>
            </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
