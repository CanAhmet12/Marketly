"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchStudioPlaylists } from "@/features/studio/fetch-studio";
import type { StudioPlaylistItem } from "@/features/studio/repository/types";
import { isMockDataEnabled } from "@/mock/config";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { studioUi } from "@/features/studio/lib/studio-ui";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { formatCompactCount } from "@/lib/format-compact-count";
import { getStudioRepository } from "@/features/studio/repository";
import { cn } from "@/lib/cn";

export function StudioPlaylistsClient() {
  const { user } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);

  const ownerId = useStudioOwnerId(user);

  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const [livePlaylists, setLivePlaylists] = useState<StudioPlaylistItem[]>([]);
  useEffect(() => {
    if (!ownerId || !liveMode) return;
    fetchStudioPlaylists(getSupabaseBrowserClient(), ownerId).then(setLivePlaylists);
  }, [ownerId, liveMode]);

  const playlists = useMemo(() => {
    if (!ownerId) return [];
    if (liveMode) return livePlaylists;
    return getStudioRepository().getPlaylists(ownerId);
  }, [ownerId, liveMode, livePlaylists]);

  if (playlists.length === 0) {
    return (
      <div className={cn(studioUi.page, studioUi.panel, studioUi.panelPad)}>
        <EmptyState
          title="Oynatma listesi yok"
          description="Video ve short içeriklerinizden liste oluşturun; izleme sayfası ve profil ile bağlantılıdır."
          actionLabel="İçerikler"
          actionHref="/studio/content"
          secondaryActionLabel="Videolar"
          secondaryActionHref="/videos"
          tone="creator"
          compact
        />
      </div>
    );
  }

  return (
    <div className={cn(studioUi.page, "flex flex-col gap-[var(--sp-3)]")}>
      {msg ? <p className={studioUi.hint}>{msg}</p> : null}
      <ul className={cn(studioUi.listWrap, studioUi.divide)}>
        {playlists.map((pl) => (
          <li key={pl.id} className="flex min-w-0 flex-col gap-[var(--sp-2)] p-[var(--sp-3)] sm:flex-row sm:items-center">
            <div className="h-16 w-28 shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-muted)] ring-1 ring-[color-mix(in_srgb,var(--color-border)_65%,transparent)]">
              {pl.coverThumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pl.coverThumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/playlist/${encodeURIComponent(pl.id)}`} className="font-bold text-[var(--color-text)] hover:text-[var(--color-primary-dark)] hover:underline">
                {pl.title}
              </Link>
              <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-snug text-[var(--color-text-secondary)]">{pl.description}</p>
              <p className="mt-1 text-[11px] font-semibold text-[var(--color-meta)]">
                {formatCompactCount(pl.videoCount)} video · {pl.visibility} · güncellendi {new Date(pl.updatedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={pl.memberPostIds[0] ? `/watch/${encodeURIComponent(pl.memberPostIds[0])}?list=${encodeURIComponent(pl.id)}` : `/playlist/${encodeURIComponent(pl.id)}`}
                className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-text)] px-[var(--sp-3)] py-2 text-[12px] font-bold text-[var(--color-surface)] hover:opacity-[0.92]"
              >
                Oynat
              </Link>
              <Link
                href={`/playlist/${encodeURIComponent(pl.id)}`}
                className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] px-[var(--sp-3)] py-2 text-[12px] font-bold hover:bg-[var(--color-surface-hover)]"
              >
                Liste
              </Link>
              <button
                type="button"
                className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] px-[var(--sp-3)] py-2 text-[12px] font-bold hover:bg-[var(--color-surface-hover)]"
                onClick={() => setMsg(`“${pl.title}” düzenleme kuyruğa alındı (mock).`)}
              >
                Düzenle
              </button>
              <button
                type="button"
                className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] px-[var(--sp-3)] py-2 text-[12px] font-bold hover:bg-[var(--color-surface-hover)]"
                onClick={() => setMsg(`“${pl.title}” sıralama modu (mock).`)}
              >
                Sırala
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
