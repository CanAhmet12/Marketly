"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { StudioLiveHealthPanel } from "@/features/studio/components/studio-live-health-panel";
import { StudioLiveObsDock } from "@/features/studio/components/studio-live-obs-dock";
import { StudioLiveSchedulePanel } from "@/features/studio/components/studio-live-schedule-panel";
import { StudioSubpageSkeleton } from "@/features/studio/components/studio-states";
import { fetchStudioLiveCommand } from "@/features/studio/fetch-studio-live";
import { scheduleToLiveCommand } from "@/features/studio/lib/studio-live-command";
import {
  buildLiveHealth,
  buildLiveTips,
  buildObsChecklist,
  formatLiveDuration,
} from "@/features/studio/lib/studio-live-insights";
import { getStudioRepository } from "@/features/studio/repository";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";
import { formatCompactCount } from "@/lib/format-compact-count";

const SCENE_CARDS = [
  { title: "Sinyal Odası", desc: "Aktif sinyallerinizi canlı yorumlayın", href: "/signals" },
  { title: "Piyasa Analizi", desc: "Canlı piyasa hareketlerini takip edin", href: "/markets" },
  { title: "Q&A Oturumu", desc: "Takipçilerle etkileşime geçin", href: "/studio/content" },
] as const;

export function StudioLiveClient() {
  const { user } = useAuth();
  const ownerId = useStudioOwnerId(user);
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const liveQuery = useQuery({
    queryKey: queryKeys.studioLive(ownerId),
    queryFn: () => fetchStudioLiveCommand(getSupabaseBrowserClient(), ownerId!),
    enabled: liveMode && Boolean(ownerId),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const command = useMemo(() => {
    if (!ownerId) return null;
    if (liveMode) return liveQuery.data ?? null;
    const schedule = getStudioRepository().getLiveSchedule(ownerId);
    return scheduleToLiveCommand(schedule);
  }, [ownerId, liveMode, liveQuery.data]);

  if (!ownerId) {
    return (
      <EmptyState
        title="Giriş gerekli"
        description="Canlı yayın stüdyosu için oturum açın."
        tone="social"
        compact
      />
    );
  }

  if (liveMode && liveQuery.isLoading && !command) {
    return <StudioSubpageSkeleton />;
  }

  if (liveMode && liveQuery.isError && !command) {
    return (
      <EmptyState
        title="Canlı veri yüklenemedi"
        description="Yayın oturumları alınamadı. Bağlantınızı kontrol edin."
        actionLabel="Yenile"
        onAction={() => void liveQuery.refetch()}
        tone="social"
        compact
      />
    );
  }

  if (!command) {
    return <StudioSubpageSkeleton />;
  }

  const health = buildLiveHealth(command);
  const tips = buildLiveTips(command);
  const obsSteps = buildObsChecklist(command);
  const active = command.activeSession;
  const durationLabel = active ? formatLiveDuration(active.startedAt) : null;

  return (
    <div className="st-dash-stack">
      <div className="st-live-hero">
        <div>
          <div className="st-live-status">
            <div className={active ? "st-live-online-dot" : "st-live-offline-dot"} />
            {active ? "Şu an yayında" : "Şu an çevrimdışı"}
          </div>
          <div className="st-live-title">
            {active ? active.title : "Canlı Yayın Komuta Merkezi"}
          </div>
          <div className="st-live-sub">
            {active
              ? `${formatCompactCount(active.viewerCount)} izleyici · ${durationLabel}`
              : "Piyasa analizi, sinyal yorumu ve canlı tartışma için yayın başlatın."}
          </div>
        </div>
        <div className="st-live-hero-actions">
          {active ? (
            <Link href={active.href} className="studio-hbtn studio-hbtn--live st-live-hero-btn">
              Yayını Yönet
            </Link>
          ) : (
            <Link href="/upload" className="studio-hbtn studio-hbtn--live st-live-hero-btn">
              Yayın Başlat
            </Link>
          )}
          <Link href="/studio/scheduled" className="studio-hbtn studio-hbtn--ghost">
            Program Düzenle
          </Link>
        </div>
      </div>

      <div className="st-live-command-grid">
        <StudioLiveHealthPanel health={health} durationLabel={durationLabel} />
        <StudioLiveObsDock steps={obsSteps} activeSession={active} />
      </div>

      <div className="st-live-scene-grid">
        {SCENE_CARDS.map((c) => (
          <Link key={c.title} href={c.href} className="st-live-scene-card">
            <div className="st-live-scene-title">{c.title}</div>
            <div className="st-live-scene-desc">{c.desc}</div>
          </Link>
        ))}
      </div>

      <div className="st-block">
        <div className="st-block-header">
          <div className="st-block-title">Hızlı İpuçları</div>
        </div>
        <div className="st-live-tips">
          {tips.map((tip) => (
            <div key={tip.id} className="st-tip-card">
              <div className="st-tip-title">{tip.title}</div>
              <p className="st-tip-body">{tip.body}</p>
              <Link href={tip.href} className="st-tip-cta">
                {tip.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="st-analytics-split-grid">
        <StudioLiveSchedulePanel
          title="Programlı Yayınlar"
          items={command.scheduled}
          emptyTitle="Zamanlanmış yayın yok"
          emptyBody="Yayın tarihi seçerek takipçilerinize önceden duyuru gönderin."
          actionHref="/studio/scheduled"
          actionLabel="Zamanla"
        />
        <StudioLiveSchedulePanel
          title="Son Oturumlar"
          items={command.endedRecent}
          emptyTitle="Geçmiş oturum yok"
          emptyBody="Tamamlanan yayınlar burada listelenir."
          actionHref="/live"
          actionLabel="Keşfet"
        />
      </div>
    </div>
  );
}
