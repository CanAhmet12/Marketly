"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { AUTH_REGISTER_SCENE } from "@/features/auth/auth-scenes";
import { getAuthRepository } from "@/features/auth/repository";
import { useAuth } from "@/features/auth/use-auth";
import { navigateAfterAuth } from "@/lib/auth/post-login-nav";
import { safeInternalNextPath } from "@/lib/auth/safe-next-path";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, isSubmitting, error, clearError, configError } = useAuth();
  const form = useMemo(() => getAuthRepository().getFormPresentation("register"), []);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  const nextQ = useMemo(() => {
    const raw = searchParams.get("next");
    if (!raw?.trim()) return "";
    return `?next=${encodeURIComponent(safeInternalNextPath(raw))}`;
  }, [searchParams]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      setInfo(null);
      const { ok, needsEmailConfirmation } = await signUp(displayName, email, password);
      if (ok && needsEmailConfirmation) {
        router.replace(`/auth/confirm-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      } else if (ok) {
        setInfo("Hesabın hazır. Yönlendiriliyorsun.");
        navigateAfterAuth(searchParams.get("next"), "/onboarding/setup");
      }
    },
    [signUp, displayName, email, password, clearError, router, searchParams],
  );

  return (
    <div className="auth-form-panel">
      {configError ? (
        <div role="alert" className="auth-form-alert auth-form-alert--warn">
          {configError}
        </div>
      ) : null}

      <header className="auth-form-panel__head">
        <span className="auth-form-panel__kicker">{AUTH_REGISTER_SCENE.kicker}</span>
        <h2 className="auth-form-panel__title">{form.title}</h2>
        <p className="auth-form-panel__subtitle">{form.subtitle}</p>
      </header>

      <form onSubmit={onSubmit} className="auth-form-panel__form">
        <div className="auth-form-panel__fields">
          <div className="auth-form-field">
            <label htmlFor="name">Görünen ad</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ad Soyad"
              disabled={isSubmitting}
            />
          </div>
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
        {info ? (
          <div role="status" aria-live="polite" className="auth-form-alert auth-form-alert--ok">
            {info}
          </div>
        ) : null}

        <div className="auth-form-panel__actions">
          <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="auth-form-submit">
            {isSubmitting ? "Kaydediliyor…" : form.primary_cta}
          </button>

          <div className="auth-form-links">
            <span>
              Zaten hesabın var mı? <Link href={`/auth/login${nextQ}`}>Giriş yap</Link>
            </span>
          </div>
        </div>
      </form>

      {form.secondary_hint ? <p className="auth-form-hint">{form.secondary_hint}</p> : null}
    </div>
  );
}
