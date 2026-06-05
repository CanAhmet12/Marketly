"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { applyContentEdits, readContentEdit, saveContentEdit } from "@/features/studio/lib/content-edits-storage";
import { getStudioRepository } from "@/features/studio/repository";
import type { StudioVisibility } from "@/features/studio/types";
import { useStudioLocalMutations } from "@/features/studio/use-studio-local-mutations";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";

type Props = { contentId: string };

const VIS_OPTIONS: { id: StudioVisibility; label: string }[] = [
  { id: "public", label: "Herkese açık" },
  { id: "unlisted", label: "Liste dışı" },
  { id: "private", label: "Gizli" },
];

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--st-border)",
  background: "var(--st-surface)",
  color: "var(--st-text)",
  fontSize: 13,
  fontFamily: "inherit",
};

export function StudioContentEditClient({ contentId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const { mutations } = useStudioLocalMutations(mockOn);
  const ownerId = useStudioOwnerId(user);

  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState("");
  const [visibility, setVisibility] = useState<StudioVisibility>("public");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const liveMode = !mockOn && isSupabaseConfigured();

  // BE-REP-003: Mock true → repo (getContentItems); Mock false → Supabase posts tablosu
  const baseItem = useMemo(() => {
    if (!ownerId || liveMode) return null; // live mode async olarak yükleniyor
    const items = getStudioRepository().getContentItems(ownerId, mutations) ?? [];
    return items.find((i) => i.id === contentId) ?? null;
  }, [ownerId, mutations, contentId, liveMode]);

  useEffect(() => {
    if (!ownerId) return;

    if (liveMode) {
      // BE-REP-003: Supabase'den post yükle — sadece kendi içeriği
      const client = getSupabaseBrowserClient();
      client
        .from("posts")
        .select("id, user_id, title, content, type")
        .eq("id", contentId)
        .eq("user_id", ownerId) // sadece kendi içeriği
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            setNotFound(true);
          } else {
            setTitle(data.title ?? "");
            setPreview(data.content ?? "");
            setVisibility("public");
            setNotFound(false);
          }
          setReady(true);
        });
      return;
    }

    // Mock true path
    if (!baseItem) {
      queueMicrotask(() => { setNotFound(true); setReady(true); });
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
      // WG-001: write-gate — salt-okuma fazında Supabase UPDATE bloke
      if (!isWebWriteEnabled()) {
        setSaveError(WEB_WRITE_BLOCKED_MESSAGE);
        setSaving(false);
        return;
      }
      // BE-REP-003: Supabase UPDATE — sadece authenticated user kendi postunu güncelleyebilir (RLS)
      try {
        const client = getSupabaseBrowserClient();
        const { error } = await client
          .from("posts")
          .update({ title: title.trim() || null, content: preview.trim() })
          .eq("id", contentId)
          .eq("user_id", ownerId ?? ""); // RLS ek güvence
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

    // Mock true path — localStorage
    if (!baseItem) { setSaving(false); return; }
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
    return <EmptyState title="Giriş gerekli" description="İçerik düzenlemek için oturum açın." tone="social" compact />;
  }

  if (!ready) {
    return (
      <div style={{ padding: 24, color: "var(--st-meta)", fontSize: 13 }}>Yükleniyor…</div>
    );
  }

  if (notFound || !baseItem) {
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

  const lastEdit = readContentEdit(contentId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--st-meta)" }}>
            İçerik düzenle
          </p>
          <h1 style={{ margin: "4px 0 0", fontSize: 20, fontFamily: "var(--font-bold)", color: "var(--st-text)" }}>
            {baseItem.kind.toUpperCase()} · {baseItem.id}
          </h1>
        </div>
        <Link href="/studio/content" className="studio-hbtn studio-hbtn--ghost">← Geri</Link>
      </div>

      <div className="st-block" style={{ display: "flex", flexDirection: "column", gap: 14, padding: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--st-text-2)" }}>Başlık</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={fieldStyle}
            maxLength={120}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--st-text-2)" }}>Önizleme metni</span>
          <textarea
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            rows={5}
            style={{ ...fieldStyle, resize: "vertical", minHeight: 100 }}
            maxLength={500}
          />
        </label>

        <div>
          <span style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 700, color: "var(--st-text-2)" }}>Görünürlük</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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

        {lastEdit && (
          <p style={{ margin: 0, fontSize: 11, color: "var(--st-meta)" }}>
            Son kayıt: {new Date(lastEdit.updatedAt).toLocaleString("tr-TR")}
          </p>
        )}

        {saveError && (
          <p style={{ margin: 0, fontSize: 12, color: "var(--st-danger, #c0392b)" }} role="alert">
            {saveError}
          </p>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="studio-hbtn studio-hbtn--accent"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          {baseItem.href && (
            <Link href={baseItem.href} className="studio-hbtn studio-hbtn--ghost" target="_blank">
              Canlı önizleme →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
