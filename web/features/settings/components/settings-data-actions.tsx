"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/use-auth";
import {
  SettingsBtnRow,
  SettingsButton,
  SettingsDangerZone,
  SettingsExportBlock,
  SettingsField,
  SettingsInfoBox,
} from "@/features/settings/components/settings-ui";
import { requestAccountDeletion } from "@/features/settings/lib/delete-account";
import { downloadJsonExport, exportUserData } from "@/features/settings/lib/export-user-data";
import type { SettingsBundle } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isWebWriteEnabled } from "@/lib/supabase/write-guard";

const DELETE_CONFIRM = "hesabımı sil";

type Props = {
  userId: string;
  bundle: SettingsBundle;
};

export function SettingsDataActions({ userId, bundle }: Props) {
  const router = useRouter();
  const { signOut } = useAuth();
  const mockOn = isMockDataEnabled();
  const live = !mockOn && isSupabaseConfigured();

  const [exportBusy, setExportBusy] = useState(false);
  const [exportOk, setExportOk] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onExport = useCallback(async () => {
    setExportError(null);
    setExportOk(false);
    if (mockOn) {
      downloadJsonExport({
        exported_at: new Date().toISOString(),
        user_id: userId || "demo",
        profile: null,
        settings: bundle,
        posts: [],
        signals: [],
        saved_posts: [],
        watchlist: [],
        follows_following: [],
        follows_followers: [],
      });
      setExportOk(true);
      return;
    }
    if (!userId) return;
    setExportBusy(true);
    try {
      const payload = await exportUserData(userId, bundle);
      downloadJsonExport(payload);
      setExportOk(true);
    } catch {
      setExportError("Veri dışa aktarılamadı.");
    } finally {
      setExportBusy(false);
    }
  }, [mockOn, userId, bundle]);

  const onDelete = useCallback(async () => {
    setDeleteError(null);
    if (deleteConfirm.trim().toLowerCase() !== DELETE_CONFIRM) {
      setDeleteError(`Onay için "${DELETE_CONFIRM}" yazın.`);
      return;
    }
    if (!isWebWriteEnabled()) {
      setDeleteError("Beta salt-okuma modunda hesap silme kapalı.");
      return;
    }
    setDeleteBusy(true);
    try {
      await requestAccountDeletion(deleteConfirm);
      await signOut();
      router.replace("/welcome");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Hesap silinemedi.");
    } finally {
      setDeleteBusy(false);
    }
  }, [deleteConfirm, signOut, router]);

  return (
    <>
      <SettingsExportBlock
        title="Veri Dışa Aktarma"
        desc="Profil, tercihler, gönderiler, sinyaller, kayıtlar ve izleme listeni JSON olarak indir."
        actionLabel={exportBusy ? "Hazırlanıyor…" : "Veriyi dışa aktar"}
        disabled={exportBusy || (!live && !mockOn)}
        onAction={onExport}
      />
      {exportOk ? <SettingsInfoBox>Dışa aktarma indirildi.</SettingsInfoBox> : null}
      {exportError ? <div className="stg-inline-error">{exportError}</div> : null}

      {!deleteOpen ? (
        <SettingsDangerZone
          title="Tehlikeli Bölge"
          desc="Hesabını kalıcı olarak silersin. Bu işlem geri alınamaz."
          actionLabel="Hesabı sil…"
          disabled={!live}
          onAction={() => setDeleteOpen(true)}
        />
      ) : (
        <div className="stg-danger-zone">
          <div className="stg-danger-zone-title">Hesabı sil</div>
          <p className="stg-danger-zone-desc">
            Tüm içerikler, takipçiler ve tercihler kalıcı olarak silinir. Onaylamak için{" "}
            <strong>{DELETE_CONFIRM}</strong> yaz.
          </p>
          <SettingsField label="Onay metni">
            <input
              className="stg-input stg-input--wide"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={DELETE_CONFIRM}
              autoComplete="off"
            />
          </SettingsField>
          <SettingsBtnRow>
            <SettingsButton variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); setDeleteError(null); }}>
              İptal
            </SettingsButton>
            <SettingsButton variant="danger" onClick={onDelete} disabled={deleteBusy || !live}>
              {deleteBusy ? "Siliniyor…" : "Kalıcı olarak sil"}
            </SettingsButton>
          </SettingsBtnRow>
          {deleteError ? <div className="stg-inline-error">{deleteError}</div> : null}
        </div>
      )}
    </>
  );
}
