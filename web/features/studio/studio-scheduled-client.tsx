"use client";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchStudioScheduled } from "@/features/studio/fetch-studio";
import type { StudioScheduledItem } from "@/features/studio/repository/types";

import { EmptyState } from "@/components/states";
import { StudioPageHead } from "@/features/studio/components/studio-page-head";
import { useAuth } from "@/features/auth/use-auth";
import { useStudioLocalMutations } from "@/features/studio/use-studio-local-mutations";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { getStudioRepository } from "@/features/studio/repository";
import { isMockDataEnabled } from "@/mock/config";
import { useRegisterPageLoad } from "@/hooks/use-register-page-load";

function scheduleLabel(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StudioScheduledClient() {
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const { mutations, setMutations } = useStudioLocalMutations(mockOn);
  const ownerId = useStudioOwnerId(user);

  const liveMode = !mockOn && isSupabaseConfigured();
  const [liveScheduled, setLiveScheduled] = useState<StudioScheduledItem[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    if (!ownerId || !liveMode) {
      setLiveLoading(false);
      return;
    }
    let cancelled = false;
    setLiveLoading(true);
    fetchStudioScheduled(getSupabaseBrowserClient(), ownerId)
      .then((rows) => {
        if (!cancelled) setLiveScheduled(rows);
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ownerId, liveMode]);

  useRegisterPageLoad(liveLoading);

  const rows = useMemo(() => {
    if (!ownerId) return [];
    if (liveMode) return liveScheduled;
    return getStudioRepository().getScheduledPosts(ownerId, mutations);
  }, [ownerId, mutations, liveMode, liveScheduled]);

  const onCancel = (id: string) => {
    setMutations((prev) => ({
      ...prev,
      cancelledScheduledIds: prev.cancelledScheduledIds.includes(id)
        ? prev.cancelledScheduledIds
        : [...prev.cancelledScheduledIds, id],
    }));
  };

  return (
    <div className="st-dash-stack">
      <StudioPageHead
        eyebrow="İçerik"
        title="Zamanlanmış"
        description="Yayın takviminiz — planlanan içerik ve canlı oturumlar."
      />
      <p className="st-hint">
        Zamanlanmış yayınlar üretimde Edge ile işlenir; bu görünüm mock veri ve yerel iptal durumunu yansıtır.
      </p>

      {rows.length === 0 ? (
        <EmptyState
          title="Zamanlanmış içerik yok"
          description="Yayın tarihi seçerek içerik planlayın; yayın akışı profil ve keşfet ile bağlantılıdır."
          actionLabel="Yükle"
          actionHref="/upload"
          tone="creator"
          compact
        />
      ) : (
        <div className="st-block">
          <div className="st-block-header">
            <div className="st-block-title">{rows.length} zamanlanmış</div>
          </div>
          <div>
            {rows.map((r) => (
              <div key={r.id} className="st-list-item">
                <div className="st-list-thumb">
                  {r.thumbnailUrl ? (
                    <img src={r.thumbnailUrl} alt="" />
                  ) : (
                    <span className="st-list-thumb-placeholder">{r.contentKind}</span>
                  )}
                </div>
                <div className="st-list-info">
                  <div className="st-list-title">{r.title}</div>
                  <p className="st-list-preview">{r.preview}</p>
                  <div className="st-list-meta">
                    Yayın · {scheduleLabel(r.scheduledFor)} · {r.platformTarget} · {r.status}
                  </div>
                </div>
                <div className="st-list-actions">
                  <button type="button" className="st-list-action">
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="st-list-action st-list-action--danger"
                    onClick={() => onCancel(r.id)}
                  >
                    İptal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
