"use client";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchStudioScheduled } from "@/features/studio/fetch-studio";
import type { StudioScheduledItem } from "@/features/studio/repository/types";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { studioUi } from "@/features/studio/lib/studio-ui";
import { useStudioLocalMutations } from "@/features/studio/use-studio-local-mutations";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { getStudioRepository } from "@/features/studio/repository";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

function scheduleLabel(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function StudioScheduledClient() {
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const { mutations, setMutations } = useStudioLocalMutations(mockOn);

  const ownerId = useStudioOwnerId(user);

  const liveMode = !mockOn && isSupabaseConfigured();
  const [liveScheduled, setLiveScheduled] = useState<StudioScheduledItem[]>([]);
  useEffect(() => {
    if (!ownerId || !liveMode) return;
    fetchStudioScheduled(getSupabaseBrowserClient(), ownerId).then(setLiveScheduled);
  }, [ownerId, liveMode]);

  const rows = useMemo(() => {
    if (!ownerId) return [];
    if (liveMode) return liveScheduled;
    return getStudioRepository().getScheduledPosts(ownerId, mutations);
  }, [ownerId, mutations, liveMode, liveScheduled]);

  const onCancel = (id: string) => {
    setMutations((prev) => ({
      ...prev,
      cancelledScheduledIds: prev.cancelledScheduledIds.includes(id) ? prev.cancelledScheduledIds : [...prev.cancelledScheduledIds, id],
    }));
  };

  return (
    <div className={cn(studioUi.page, "flex flex-col gap-[var(--sp-3)]")}>
      <p className={studioUi.hint}>
        Zamanlanmış yayınlar üretimde Edge ile işlenir; bu görünüm mock veri ve yerel iptal durumunu yansıtır.
      </p>
      {rows.length === 0 ? (
        <div className={cn(studioUi.panel, studioUi.panelPad)}>
          <EmptyState
            title="Zamanlanmış içerik yok"
            description="Yayın tarihi seçerek içerik planlayın; yayın akışı profil ve keşfet ile bağlantılıdır."
            actionLabel="Yükle"
            actionHref="/upload"
            tone="creator"
            compact
          />
        </div>
      ) : (
        <ul className={cn(studioUi.listWrap, studioUi.divide)}>
          {rows.map((r) => (
            <li key={r.id} className="flex min-w-0 flex-col gap-[var(--sp-2)] p-[var(--sp-3)] md:flex-row md:items-center">
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-muted)] ring-1 ring-[color-mix(in_srgb,var(--color-border)_65%,transparent)]">
                {r.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-[var(--color-meta)]">{r.contentKind}</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[var(--color-text)]">{r.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-[var(--color-text-secondary)]">{r.preview}</p>
                <p className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-semibold text-[var(--color-meta)]">
                  <span>Yayın · {scheduleLabel(r.scheduledFor)}</span>
                  <span className="text-[var(--color-border)]">·</span>
                  <span>{r.platformTarget}</span>
                  <span className="text-[var(--color-border)]">·</span>
                  <span className="uppercase">{r.status}</span>
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] px-[var(--sp-3)] py-2 text-[12px] font-bold hover:bg-[var(--color-surface-hover)]"
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] px-[var(--sp-3)] py-2 text-[12px] font-bold text-[var(--color-text-secondary)] hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
                  onClick={() => onCancel(r.id)}
                >
                  İptal
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
