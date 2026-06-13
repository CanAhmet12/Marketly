"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchStudioDrafts } from "@/features/studio/fetch-studio";
import type { StudioDraftItem } from "@/features/studio/repository/types";

import { EmptyState } from "@/components/states";
import { StudioPageHead } from "@/features/studio/components/studio-page-head";
import { useAuth } from "@/features/auth/use-auth";
import { useStudioLocalMutations } from "@/features/studio/use-studio-local-mutations";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { getStudioRepository } from "@/features/studio/repository";
import { isMockDataEnabled } from "@/mock/config";
import { useRegisterPageLoad } from "@/hooks/use-register-page-load";

function editedLabel(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StudioDraftsClient() {
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const { mutations, setMutations } = useStudioLocalMutations(mockOn);
  const ownerId = useStudioOwnerId(user);

  const liveMode = !mockOn && isSupabaseConfigured();
  const [liveDrafts, setLiveDrafts] = useState<StudioDraftItem[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    if (!ownerId || !liveMode) {
      setLiveLoading(false);
      return;
    }
    let cancelled = false;
    setLiveLoading(true);
    fetchStudioDrafts(getSupabaseBrowserClient(), ownerId)
      .then((rows) => {
        if (!cancelled) setLiveDrafts(rows);
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ownerId, liveMode]);

  useRegisterPageLoad(liveLoading);

  const drafts = useMemo(() => {
    if (!ownerId) return [];
    if (liveMode) return liveDrafts;
    return getStudioRepository().getDrafts(ownerId, mutations);
  }, [ownerId, mutations, liveMode, liveDrafts]);

  const onDelete = (id: string) => {
    setMutations((prev) => ({
      ...prev,
      deletedDraftIds: prev.deletedDraftIds.includes(id)
        ? prev.deletedDraftIds
        : [...prev.deletedDraftIds, id],
    }));
  };

  if (drafts.length === 0) {
    return (
      <EmptyState
        title="Taslak yok"
        description="Yarım kalan gönderi veya videolarınız burada listelenir."
        actionLabel="Oluştur"
        actionHref="/upload"
        tone="creator"
        compact
      />
    );
  }

  return (
    <div className="st-dash-stack">
      <StudioPageHead
        eyebrow="İçerik"
        title="Taslaklar"
        description="Yarım kalan videolar ve gönderiler — kaldığınız yerden devam edin."
        actions={
          <Link href="/upload" className="studio-hbtn studio-hbtn--accent">+ Yeni</Link>
        }
      />
      <div className="st-block st-block--flush">
      <div className="st-block-header">
        <div className="st-block-title">{drafts.length} taslak</div>
      </div>
      <div>
        {drafts.map((d) => (
          <div key={d.id} className="st-list-item">
            <div className="st-list-thumb">
              {d.thumbnailUrl ? (
                <img src={d.thumbnailUrl} alt="" />
              ) : (
                <span className="st-list-thumb-placeholder">{d.kind}</span>
              )}
            </div>
            <div className="st-list-info">
              <div className="st-list-title">
                {d.title}
                <span className="st-list-kind">{d.kind}</span>
              </div>
              <p className="st-list-preview">{d.preview}</p>
              <div className="st-list-meta">Son düzenleme · {editedLabel(d.lastEditedAt)}</div>
            </div>
            <div className="st-list-actions">
              <Link href="/upload" className="st-list-action st-list-action--primary">
                Devam et
              </Link>
              <button type="button" className="st-list-action st-list-action--danger" onClick={() => onDelete(d.id)}>
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
