"use client";

import { useCallback, useRef, useState } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { SettingsInfoBox } from "@/features/settings/components/settings-ui";
import { uploadAvatar } from "@/features/settings/lib/upload-avatar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type Props = {
  avatarUrl: string | null;
  initials: string;
  onUploaded: (url: string) => void;
  disabled?: boolean;
};

export function SettingsAvatarUpload({ avatarUrl, initials, onUploaded, disabled }: Props) {
  const { refreshProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onPick = useCallback(
    async (file: File | null) => {
      if (!file || disabled) return;
      setError(null);
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      try {
        const client = getSupabaseBrowserClient();
        const { data: sessionData } = await client.auth.getSession();
        const uid = sessionData.session?.user.id;
        if (!uid) throw new Error("Oturum bulunamadı.");

        const publicUrl = await uploadAvatar(client, uid, file);
        onUploaded(publicUrl);
        await refreshProfile();
      } catch (e) {
        setPreview(null);
        setError(e instanceof Error ? e.message : "Yükleme başarısız.");
      } finally {
        setUploading(false);
      }
    },
    [disabled, onUploaded, refreshProfile],
  );

  const shown = preview ?? avatarUrl;

  return (
    <div className="stg-avatar-upload">
      <button
        type="button"
        className={cn("stg-avatar-upload-btn", uploading && "stg-avatar-upload-btn--busy")}
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        aria-label="Avatar yükle"
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="stg-avatar-upload-img" />
        ) : (
          <span className="stg-avatar-upload-fallback">{initials}</span>
        )}
        <span className="stg-avatar-upload-overlay">{uploading ? "…" : "Değiştir"}</span>
      </button>

      <div className="stg-avatar-upload-meta">
        <div className="stg-avatar-upload-title">Profil fotoğrafı</div>
        <div className="stg-avatar-upload-hint">JPEG, PNG veya WebP · en fazla 5 MB</div>
        {error ? <div className="stg-avatar-upload-error">{error}</div> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          void onPick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function SettingsAvatarUploadHint({ mockOn }: { mockOn: boolean }) {
  if (mockOn) {
    return <SettingsInfoBox>Demo modda avatar URL alanı kullanılır; canlı modda dosya yüklenir.</SettingsInfoBox>;
  }
  return null;
}
