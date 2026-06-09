"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { StudioSubpageSkeleton } from "@/features/studio/components/studio-states";
import { StudioWriteGateNotice } from "@/features/studio/components/studio-write-gate-notice";
import { applyContentEdits, readContentEdit, saveContentEdit } from "@/features/studio/lib/content-edits-storage";
import {
  contentKindLabelTr,
} from "@/features/studio/lib/studio-content-display";
import {
  studioContentHref,
  studioContentKindLabel,
} from "@/features/studio/lib/studio-content-href";
import { getStudioRepository } from "@/features/studio/repository";
import type { CreatorContentItem, StudioVisibility } from "@/features/studio/types";
import { useStudioLocalMutations } from "@/features/studio/use-studio-local-mutations";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";

type Props = { contentId: string };

type EditMeta = Pick<CreatorContentItem, "id" | "kind" | "href">;

const VIS_OPTIONS: { id: StudioVisibility; label: string }[] = [
  { id: "public", label: "Herkese açık" },
  { id: "unlisted", label: "Liste dışı" },
  { id: "private", label: "Gizli" },
];

export function StudioContentEditClient({ contentId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const writeEnabled = !liveMode || isWebWriteEnabled();
  const { mutations } = useStudioLocalMutations(mockOn);
  const ownerId = useStudioOwnerId(user);

  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState("");
  const [visibility, setVisibility] = useState<StudioVisibility>("public");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [liveMeta, setLiveMeta] = useState<EditMeta | null>(null);

  const baseItem = useMemo(() => {
    if (!ownerId || liveMode) return null;
    const items = getStudioRepository().getContentItems(ownerId, mutations) ?? [];
    return items.find((i) => i.id === contentId) ?? null;
  }, [ownerId, mutations, contentId, liveMode]);

  const editMeta: EditMeta | null = baseItem ?? liveMeta;

  useEffect(() => {
    if (!ownerId) return;

    if (liveMode) {
      const client = getSupabaseBrowserClient();
      client
        .from("posts")
        .select("id, user_id, title, content, type")
        .eq("id", contentId)
        .eq("user_id", ownerId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            setNotFound(true);
            setLiveMeta(null);
          } else {
            const kind = studioContentKindLabel(data.type) as EditMeta["kind"];
            setTitle(data.title ?? "");
            setPreview(data.content ?? "");
            setVisibility("public");
            setLiveMeta({
              id: String(data.id),
              kind,
              href: studioContentHref(data.type, String(data.id)),
            });
            setNotFound(false);
          }
          setReady(true);
        });
      return;
    }

    if (!baseItem) {
      queueMicrotask(() => {
        setNotFound(true);
        setReady(true);
      });
      return;
    }

    const merged = applyContentEdits(baseItem);
    queueMicrotask(() => {
      setTitle(merged.title);
      setPreview(merged.preview);
      setVisibility(merged.visibility);
      setNotFound(false);
      setReady(true);
    });
  }, [ownerId, baseItem, contentId, liveMode]);

  const onSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);

    if (liveMode) {
      if (!isWebWriteEnabled()) {
        setSaveError(WEB_WRITE_BLOCKED_MESSAGE);
        setSaving(false);
        return;
      }
      try {
        const client = getSupabaseBrowserClient();
        const { error } = await client
          .from("posts")
          .update({ title: title.trim() || null, content: preview.trim() })
          .eq("id", contentId)
          .eq("user_id", ownerId ?? "");
        if (error) throw error;
        router.push("/studio/content");
        router.refresh();
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Kayıt sırasında hata oluştu.");
        console.warn("[studio-edit] save error", e);
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!baseItem) {
      setSaving(false);
      return;
    }
    saveContentEdit(contentId, {
      title: title.trim() || baseItem.title,
      preview: preview.trim(),
      visibility,
    });
    queueMicrotask(() => {
      setSaving(false);
      router.push("/studio/content");
      router.refresh();
    });
  }, [baseItem, contentId, title, preview, visibility, router, liveMode, ownerId]);

  if (!ownerId) {
    return (
      <EmptyState
        title="Giriş gerekli"
        description="İçerik düzenlemek için oturum açın."
        tone="social"
        compact
      />
    );
  }

  if (!ready) {
    return <StudioSubpageSkeleton />;
  }

  if (notFound || !editMeta) {
    return (
      <EmptyState
        title="İçerik bulunamadı"
        description="Bu kimlikte düzenlenebilir içerik yok veya erişiminiz yok."
        actionLabel="İçerik listesi"
        actionHref="/studio/content"
        tone="social"
        compact
      />
    );
  }

  const lastEdit = mockOn ? readContentEdit(contentId) : null;

  return (
    <div className="st-edit-page">
      <StudioWriteGateNotice />

      <div className="st-edit-header">
        <div>
          <p className="st-edit-eyebrow">İçerik düzenle</p>
          <h1 className="st-edit-title">
            {contentKindLabelTr(editMeta.kind)} · {editMeta.id}
          </h1>
        </div>
        <Link href="/studio/content" className="studio-hbtn studio-hbtn--ghost">
          ← Geri
        </Link>
      </div>

      <div className="st-block st-edit-form">
        <label className="st-field">
          <span className="st-field-label">Başlık</span>
          <input
            type="text"
            className="st-field-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </label>

        <label className="st-field">
          <span className="st-field-label">Önizleme metni</span>
          <textarea
            className="st-field-input st-field-input--area"
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            rows={5}
            maxLength={500}
          />
        </label>

        {!liveMode ? (
          <div className="st-field">
            <span className="st-field-label">Görünürlük</span>
            <div className="st-edit-vis-pills">
              {VIS_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={cn("st-filter-pill", visibility === o.id && "st-filter-pill--active")}
                  onClick={() => setVisibility(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {lastEdit ? (
          <p className="st-edit-meta">
            Son kayıt: {new Date(lastEdit.updatedAt).toLocaleString("tr-TR")}
          </p>
        ) : null}

        {saveError ? (
          <p className="st-edit-error" role="alert">
            {saveError}
          </p>
        ) : null}

        <div className="st-edit-actions">
          <button
            type="button"
            className="studio-hbtn studio-hbtn--accent"
            disabled={saving || !writeEnabled}
            onClick={onSave}
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          {editMeta.href ? (
            <Link href={editMeta.href} className="studio-hbtn studio-hbtn--ghost" target="_blank">
              Canlı önizleme →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
