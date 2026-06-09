"use client";

import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/use-auth";
import {
  SettingsBtnRow,
  SettingsButton,
  SettingsCardBlock,
  SettingsField,
  SettingsInfoBox,
} from "@/features/settings/components/settings-ui";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SettingsSecurityActions() {
  const mockOn = isMockDataEnabled();
  const live = !mockOn && isSupabaseConfigured();
  const { user, resetPasswordForEmail, updatePassword, error: authError, clearError } = useAuth();

  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwOk, setPwOk] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onResetEmail = useCallback(async () => {
    if (!user?.email) return;
    clearError();
    setLocalError(null);
    setResetBusy(true);
    setResetSent(false);
    try {
      const ok = await resetPasswordForEmail(user.email);
      if (ok) setResetSent(true);
      else setLocalError("E-posta gönderilemedi.");
    } finally {
      setResetBusy(false);
    }
  }, [user?.email, resetPasswordForEmail, clearError]);

  const onUpdatePassword = useCallback(async () => {
    clearError();
    setLocalError(null);
    setPwOk(false);
    if (!newPassword.trim()) {
      setLocalError("Yeni şifre girin.");
      return;
    }
    setPwBusy(true);
    try {
      const ok = await updatePassword(newPassword);
      if (ok) {
        setPwOk(true);
        setNewPassword("");
      } else {
        setLocalError(authError ?? "Şifre güncellenemedi.");
      }
    } finally {
      setPwBusy(false);
    }
  }, [newPassword, updatePassword, clearError, authError]);

  if (!live) {
    return (
      <SettingsCardBlock title="Oturum & cihazlar" accent="security">
        <SettingsInfoBox>Şifre işlemleri canlı Supabase oturumunda kullanılabilir.</SettingsInfoBox>
      </SettingsCardBlock>
    );
  }

  return (
    <SettingsCardBlock
      title="Şifre & oturum"
      desc="Şifre sıfırlama e-postası gönder veya doğrudan yeni şifre belirle."
      accent="security"
    >
      <SettingsBtnRow>
        <SettingsButton variant="outline" onClick={onResetEmail} disabled={resetBusy || !user?.email}>
          {resetBusy ? "Gönderiliyor…" : "Sıfırlama e-postası gönder"}
        </SettingsButton>
      </SettingsBtnRow>
      {resetSent ? (
        <SettingsInfoBox>Sıfırlama bağlantısı {user?.email} adresine gönderildi.</SettingsInfoBox>
      ) : null}

      <SettingsField label="Yeni şifre">
        <input
          className="stg-input stg-input--wide"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="En az 8 karakter"
        />
      </SettingsField>

      <SettingsBtnRow>
        <SettingsButton variant="outline" onClick={onUpdatePassword} disabled={pwBusy}>
          {pwBusy ? "Kaydediliyor…" : "Şifreyi güncelle"}
        </SettingsButton>
      </SettingsBtnRow>

      {pwOk ? <SettingsInfoBox>Şifren güncellendi.</SettingsInfoBox> : null}
      {localError ? <div className="stg-inline-error">{localError}</div> : null}
    </SettingsCardBlock>
  );
}
