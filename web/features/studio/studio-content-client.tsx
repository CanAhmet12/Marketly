"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchStudioContent } from "@/features/studio/fetch-studio";
import type { CreatorContentItem } from "@/features/studio/repository/types";

import { EmptyState } from "@/components/states";
import { StudioContentGrid } from "@/features/studio/components/studio-content-grid";
import { StudioContentTable } from "@/features/studio/components/studio-content-table";
import { StudioContentToolbar } from "@/features/studio/components/studio-content-toolbar";
import { StudioPageHead } from "@/features/studio/components/studio-page-head";
import { StudioSubpageSkeleton } from "@/features/studio/components/studio-states";
import { applyContentEdits } from "@/features/studio/lib/content-edits-storage";
import {
  applyContentLibrary,
  DEFAULT_CONTENT_FILTERS,
  type ContentLibraryFilters,
  type ContentViewMode,
} from "@/features/studio/lib/studio-content-library";
import { useAuth } from "@/features/auth/use-auth";
import { useStudioLocalMutations } from "@/features/studio/use-studio-local-mutations";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { getStudioRepository } from "@/features/studio/repository";
import { isMockDataEnabled } from "@/mock/config";

const VIEW_MODE_KEY = "studio-content-view";

function readViewMode(): ContentViewMode {
  if (typeof window === "undefined") return "table";
  const stored = sessionStorage.getItem(VIEW_MODE_KEY);
  return stored === "grid" ? "grid" : "table";
}

export function StudioContentClient() {
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const { mutations } = useStudioLocalMutations(mockOn);
  const ownerId = useStudioOwnerId(user);

  const [filters, setFilters] = useState<ContentLibraryFilters>(DEFAULT_CONTENT_FILTERS);
  const [viewMode, setViewMode] = useState<ContentViewMode>("table");
  const [liveItems, setLiveItems] = useState<CreatorContentItem[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(false);
  const liveMode = !mockOn && isSupabaseConfigured();

  useEffect(() => {
    setViewMode(readViewMode());
  }, []);

  useEffect(() => {
    if (!ownerId || !liveMode) return;
    let cancelled = false;
    setLiveLoading(true);
    setLiveError(false);
    fetchStudioContent(getSupabaseBrowserClient(), ownerId)
      .then((rows) => {
        if (!cancelled) setLiveItems(rows);
      })
      .catch(() => {
        if (!cancelled) setLiveError(true);
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ownerId, liveMode]);

  const items = useMemo(() => {
    if (!ownerId) return [];
    const raw = liveMode
      ? liveItems
      : (getStudioRepository().getContentItems(ownerId, mutations) ?? []);
    return raw.map(applyContentEdits);
  }, [ownerId, mutations, liveMode, liveItems]);

  const displayed = useMemo(() => applyContentLibrary(items, filters), [items, filters]);

  const setViewModePersisted = (mode: ContentViewMode) => {
    setViewMode(mode);
    sessionStorage.setItem(VIEW_MODE_KEY, mode);
  };

  if (!ownerId) {
    return (
      <EmptyState
        title="Giriş gerekli"
        description="İçerik yönetimi için oturum açın."
        tone="social"
        compact
      />
    );
  }

  if (liveMode && liveLoading && items.length === 0) {
    return <StudioSubpageSkeleton />;
  }

  if (liveMode && liveError && items.length === 0) {
    return (
      <EmptyState
        title="İçerik listesi yüklenemedi"
        description="Gönderiler alınamadı. Oturum ve bağlantınızı kontrol edin."
        actionLabel="Yenile"
        onAction={() => window.location.reload()}
        tone="social"
        compact
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Henüz içerik yok"
        description="Yayınlanmış video, gönderi ve sinyalleriniz burada listelenir."
        actionLabel="İlk İçeriği Yükle"
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
        title="Kütüphane"
        description="Yayınlanmış video, gönderi, sinyal ve canlı içeriklerinizi arayın, filtreleyin ve yönetin."
        actions={
          <>
            <Link href="/upload" className="studio-hbtn studio-hbtn--ghost">Video Yükle</Link>
            <Link href="/upload" className="studio-hbtn studio-hbtn--accent">Yeni İçerik</Link>
          </>
        }
      />

      <div className="st-block st-block--flush">
        <StudioContentToolbar
          totalCount={items.length}
          filteredCount={displayed.length}
          filters={filters}
          viewMode={viewMode}
          onQueryChange={(query) => setFilters((f) => ({ ...f, query }))}
          onKindChange={(kind) => setFilters((f) => ({ ...f, kind }))}
          onStatusChange={(status) => setFilters((f) => ({ ...f, status }))}
          onSortChange={(sortKey, sortDir) => setFilters((f) => ({ ...f, sortKey, sortDir }))}
          onViewModeChange={setViewModePersisted}
        />

        {displayed.length === 0 ? (
          <div className="st-content-empty">
            Bu filtreye uygun içerik bulunamadı.
          </div>
        ) : viewMode === "table" ? (
          <StudioContentTable
            items={displayed}
            sort={{ sortKey: filters.sortKey, sortDir: filters.sortDir }}
            onSortChange={({ sortKey, sortDir }) => setFilters((f) => ({ ...f, sortKey, sortDir }))}
          />
        ) : (
          <StudioContentGrid items={displayed} />
        )}
      </div>
    </div>
  );
}
