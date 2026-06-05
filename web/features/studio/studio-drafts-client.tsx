"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchStudioDrafts } from "@/features/studio/fetch-studio";
import type { StudioDraftItem } from "@/features/studio/repository/types";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { studioUi } from "@/features/studio/lib/studio-ui";
import { useStudioLocalMutations } from "@/features/studio/use-studio-local-mutations";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { getStudioRepository } from "@/features/studio/repository";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

function editedLabel(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function StudioDraftsClient() {
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const { mutations, setMutations } = useStudioLocalMutations(mockOn);

  const ownerId = useStudioOwnerId(user);

  const liveMode = !mockOn && isSupabaseConfigured();
  const [liveDrafts, setLiveDrafts] = useState<StudioDraftItem[]>([]);
  useEffect(() => {
    if (!ownerId || !liveMode) return;
    fetchStudioDrafts(getSupabaseBrowserClient(), ownerId).then(setLiveDrafts);
  }, [ownerId, liveMode]);

  const drafts = useMemo(() => {
    if (!ownerId) return [];
    if (liveMode) return liveDrafts;
    return getStudioRepository().getDrafts(ownerId, mutations);
  }, [ownerId, mutations, liveMode, liveDrafts]);

  const onDelete = (id: string) => {
    setMutations((prev) => ({
      ...prev,
      deletedDraftIds: prev.deletedDraftIds.includes(id) ? prev.deletedDraftIds : [...prev.deletedDraftIds, id],
    }));
  };

  if (drafts.length === 0) {
    return (
      <div className={cn(studioUi.page, studioUi.panel, studioUi.panelPad)}>
        <EmptyState
          title="Taslak yok"
          description="Yarım kalan gönderi veya videolarınız burada listelenir."
          actionLabel="Oluştur"
          actionHref="/upload"
          tone="creator"
          compact
        />
      </div>
    );
  }

  return (
    <ul className={cn(studioUi.listWrap, studioUi.divide, studioUi.page)}>
      {drafts.map((d) => (
        <li key={d.id} className="flex min-w-0 flex-col gap-[var(--sp-2)] p-[var(--sp-3)] sm:flex-row sm:items-center">
          <div className="h-14 w-24 shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-muted)] ring-1 ring-[color-mix(in_srgb,var(--color-border)_65%,transparent)]">
            {d.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-[var(--color-meta)]">{d.kind}</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-[var(--color-text)]">{d.title}</p>
              <span className="rounded-md bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{d.kind}</span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-snug text-[var(--color-text-secondary)]">{d.preview}</p>
            <p className="mt-1 text-[11px] font-semibold text-[var(--color-meta)]">Son düzenleme · {editedLabel(d.lastEditedAt)}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/upload"
              className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-text)] px-[var(--sp-3)] py-2 text-[12px] font-bold text-[var(--color-surface)] hover:opacity-[0.92]"
            >
              Devam et
            </Link>
            <button
              type="button"
              className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] px-[var(--sp-3)] py-2 text-[12px] font-bold text-[var(--color-text-secondary)] hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
              onClick={() => onDelete(d.id)}
            >
              Sil
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
