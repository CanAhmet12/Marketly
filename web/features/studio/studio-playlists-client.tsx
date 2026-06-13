"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchStudioPlaylists } from "@/features/studio/fetch-studio";
import type { StudioPlaylistItem } from "@/features/studio/repository/types";
import { isMockDataEnabled } from "@/mock/config";

import { EmptyState } from "@/components/states";
import { StudioPageHead } from "@/features/studio/components/studio-page-head";
import { useAuth } from "@/features/auth/use-auth";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { formatCompactCount } from "@/lib/format-compact-count";
import { getStudioRepository } from "@/features/studio/repository";
import { useRegisterPageLoad } from "@/hooks/use-register-page-load";

export function StudioPlaylistsClient() {
  const { user } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);
  const ownerId = useStudioOwnerId(user);

  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const [livePlaylists, setLivePlaylists] = useState<StudioPlaylistItem[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    if (!ownerId || !liveMode) {
      setLiveLoading(false);
      return;
    }
    let cancelled = false;
    setLiveLoading(true);
    fetchStudioPlaylists(getSupabaseBrowserClient(), ownerId)
      .then((rows) => {
        if (!cancelled) setLivePlaylists(rows);
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ownerId, liveMode]);

  useRegisterPageLoad(liveLoading);

  const playlists = useMemo(() => {
    if (!ownerId) return [];
    if (liveMode) return livePlaylists;
    return getStudioRepository().getPlaylists(ownerId);
  }, [ownerId, liveMode, livePlaylists]);

  if (playlists.length === 0) {
    return (
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
    );
  }

  return (
    <div className="st-dash-stack">
      <StudioPageHead
        eyebrow="İçerik"
        title="Oynatma Listeleri"
        description="Video ve short koleksiyonlarınızı düzenleyin ve yayınlayın."
      />
      {msg ? <p className="st-hint st-hint--msg">{msg}</p> : null}
      <div className="st-block st-block--flush">
        <div className="st-block-header">
          <div className="st-block-title">{playlists.length} liste</div>
        </div>
        <div>
          {playlists.map((pl) => (
            <div key={pl.id} className="st-list-item">
              <div className="st-list-thumb">
                {pl.coverThumbnailUrl ? (
                  <img src={pl.coverThumbnailUrl} alt="" />
                ) : (
                  <span className="st-list-thumb-placeholder">PL</span>
                )}
              </div>
              <div className="st-list-info">
                <Link href={`/playlist/${encodeURIComponent(pl.id)}`} className="st-list-title">
                  {pl.title}
                </Link>
                <p className="st-list-preview">{pl.description}</p>
                <div className="st-list-meta">
                  {formatCompactCount(pl.videoCount)} video · {pl.visibility} · güncellendi{" "}
                  {new Date(pl.updatedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                </div>
              </div>
              <div className="st-list-actions">
                <Link
                  href={
                    pl.memberPostIds[0]
                      ? `/watch/${encodeURIComponent(pl.memberPostIds[0])}?list=${encodeURIComponent(pl.id)}`
                      : `/playlist/${encodeURIComponent(pl.id)}`
                  }
                  className="st-list-action st-list-action--primary"
                >
                  Oynat
                </Link>
                <Link href={`/playlist/${encodeURIComponent(pl.id)}`} className="st-list-action">
                  Liste
                </Link>
                <button
                  type="button"
                  className="st-list-action"
                  onClick={() => setMsg(`"${pl.title}" düzenleme kuyruğa alındı (mock).`)}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="st-list-action"
                  onClick={() => setMsg(`"${pl.title}" sıralama modu (mock).`)}
                >
                  Sırala
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
