"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AUTH_LOGIN_SCENE } from "@/features/auth/auth-scenes";
import { getAuthRepository } from "@/features/auth/repository";
import { useAuth } from "@/features/auth/use-auth";
import { navigateAfterAuth } from "@/lib/auth/post-login-nav";
import { safeInternalNextPath } from "@/lib/auth/safe-next-path";

const CALLBACK_ERRORS: Record<string, string> = {
  auth_callback_failed: "Doğrulama bağlantısı geçersiz veya süresi dolmuş. Tekrar giriş yapın veya yeni kayıt oluşturun.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const { signIn, isSubmitting, error, clearError, configError } = useAuth();
  const form = useMemo(() => getAuthRepository().getFormPresentation("login"), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [callbackError, setCallbackError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("error");
    if (code && CALLBACK_ERRORS[code]) {
      setCallbackError(CALLBACK_ERRORS[code]);
    }
  }, [searchParams]);

  const nextQ = useMemo(() => {
    const raw = searchParams.get("next");
    if (!raw?.trim()) return "";
    return `?next=${encodeURIComponent(safeInternalNextPath(raw))}`;
  }, [searchParams]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      setCallbackError(null);
      const ok = await signIn(email, password);
      if (!ok) return;
      navigateAfterAuth(searchParams.get("next"), "/");
    },
    [signIn, email, password, clearError, searchParams],
  );

  return (
    <div className="auth-form-panel">
      {configError ? (
        <div role="alert" className="auth-form-alert auth-form-alert--warn">
          {configError}
        </div>
      ) : null}

      <header className="auth-form-panel__head">
        <span className="auth-form-panel__kicker">{AUTH_LOGIN_SCENE.kicker}</span>
        <h2 className="auth-form-panel__title">{form.title}</h2>
        <p className="auth-form-panel__subtitle">{form.subtitle}</p>
      </header>

      <form onSubmit={onSubmit} className="auth-form-panel__form">
        <div className="auth-form-panel__fields">
          <div className="auth-form-field">
            <label htmlFor="email">E-posta</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              disabled={isSubmitting}
            />
          </div>
          <div className="auth-form-field">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {error ? (
          <div role="alert" aria-live="assertive" className="auth-form-alert auth-form-alert--error">
            {error}
          </div>
        ) : null}
        {callbackError ? (
          <div role="alert" aria-live="assertive" className="auth-form-alert auth-form-alert--error">
            {callbackError}
          </div>
        ) : null}

        <div className="auth-form-panel__actions">
          <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="auth-form-submit">
            {isSubmitting ? "Giriş yapılıyor…" : form.primary_cta}
          </button>

          <div className="auth-form-links">
            <Link href={`/auth/forgot-password${nextQ}`}>Şifreni mi unuttun?</Link>
            <span className="auth-form-links__sep" aria-hidden>
              ·
            </span>
            <span>
              Hesabın yok mu? <Link href={`/auth/register${nextQ}`}>Kayıt ol</Link>
            </span>
          </div>
        </div>
      </form>

      {form.secondary_hint ? <p className="auth-form-hint">{form.secondary_hint}</p> : null}
    </div>
  );
}
