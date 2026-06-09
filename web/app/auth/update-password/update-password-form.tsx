"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { AUTH_UPDATE_SCENE } from "@/features/auth/auth-scenes";
import { AuthFormSkeleton } from "@/features/auth/components/auth-states";
import { getAuthRepository } from "@/features/auth/repository";
import { useAuth } from "@/features/auth/use-auth";

export function UpdatePasswordForm() {
  const router = useRouter();
  const { updatePassword, isSubmitting, error, clearError, configError, isInitialized } = useAuth();
  const form = useMemo(() => getAuthRepository().getFormPresentation("update"), []);
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      const ok = await updatePassword(password);
      if (ok) {
        setDone(true);
        setTimeout(() => router.replace("/auth/login"), 2200);
      }
    },
    [updatePassword, password, clearError, router],
  );

  if (!isInitialized) {
    return <AuthFormSkeleton />;
  }

  if (done) {
    return (
      <div className="auth-form-panel auth-status-panel">
        <header className="auth-form-panel__head">
          <span className="auth-form-panel__kicker">{AUTH_UPDATE_SCENE.kicker}</span>
          <h2 className="auth-form-panel__title">Şifre güncellendi</h2>
          <p className="auth-form-panel__subtitle">Giriş sayfasına yönlendiriliyorsun.</p>
        </header>

        <div className="auth-status-panel__icon" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="auth-form-panel__actions" style={{ marginTop: 28 }}>
          <Link href="/auth/login" className="auth-form-submit" style={{ textAlign: "center", lineHeight: "50px", textDecoration: "none" }}>
            Giriş yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-panel">
      {configError ? (
        <div role="alert" className="auth-form-alert auth-form-alert--warn">
          {configError}
        </div>
      ) : null}

      <header className="auth-form-panel__head">
        <span className="auth-form-panel__kicker">{AUTH_UPDATE_SCENE.kicker}</span>
        <h2 className="auth-form-panel__title">{form.title}</h2>
        <p className="auth-form-panel__subtitle">{form.subtitle}</p>
      </header>

      <form onSubmit={onSubmit} className="auth-form-panel__form">
        <div className="auth-form-panel__fields">
          <div className="auth-form-field">
            <label htmlFor="password">Yeni şifre</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 8 karakter"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {error ? (
          <div role="alert" aria-live="assertive" className="auth-form-alert auth-form-alert--error">
            {error}
          </div>
        ) : null}

        <div className="auth-form-panel__actions">
          <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="auth-form-submit">
            {isSubmitting ? "Kaydediliyor…" : form.primary_cta}
          </button>

          <div className="auth-form-links">
            <Link href="/auth/login">Girişe dön</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
