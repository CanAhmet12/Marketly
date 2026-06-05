"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "@/features/auth/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isMockDataEnabled } from "@/mock/config";
import { pushMockUploadedStory } from "@/mock/adapters/story-upload-store";

import { insertStoryRow, uploadStoryImage, validateStoryImage } from "./upload-story";

type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded?: () => void;
};

export function StoryUploadModal({ open, onClose, onUploaded }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const reset = useCallback(() => {
    setPreview(null);
    setFile(null);
    setError(null);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const onPick = (f: File | null) => {
    if (!f) return;
    const v = validateStoryImage(f);
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handlePublish = async () => {
    if (!user?.id || !file) return;
    setUploading(true);
    setError(null);
    try {
      if (isMockDataEnabled()) {
        pushMockUploadedStory(user.id, user.displayName ?? "Sen", preview ?? "");
        void qc.invalidateQueries({ queryKey: ["stories-rail"] });
        onUploaded?.();
        handleClose();
        return;
      }
      const client = getSupabaseBrowserClient();
      const { publicUrl } = await uploadStoryImage(client, user.id, file);
      const row = await insertStoryRow(client, user.id, publicUrl);
      if ("error" in row) throw new Error(row.error);
      void qc.invalidateQueries({ queryKey: ["stories-rail"] });
      onUploaded?.();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hikâye yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="story-upload" role="dialog" aria-modal aria-label="Hikâye ekle">
      <button type="button" className="story-upload__backdrop" onClick={handleClose} aria-label="Kapat" />
      <div className="story-upload__panel">
        <header className="story-upload__head">
          <h2 className="story-upload__title">Hikâye ekle</h2>
          <button type="button" className="story-upload__close" onClick={handleClose} aria-label="Kapat">
            ✕
          </button>
        </header>

        {!user ? (
          <p className="story-upload__hint">Hikâye paylaşmak için giriş yapmalısın.</p>
        ) : (
          <>
            <div className="story-upload__preview-wrap">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="story-upload__preview" />
              ) : (
                <button type="button" className="story-upload__pick" onClick={() => inputRef.current?.click()}>
                  Görsel seç
                  <span className="story-upload__pick-sub">JPEG, PNG, WebP · max 5 MB</span>
                </button>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
            {error ? <p className="story-upload__error">{error}</p> : null}
            <div className="story-upload__actions">
              {preview ? (
                <button type="button" className="story-upload__secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
                  Değiştir
                </button>
              ) : null}
              <button
                type="button"
                className="story-upload__primary"
                disabled={!file || uploading}
                onClick={() => void handlePublish()}
              >
                {uploading ? "Yükleniyor…" : "Paylaş"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
