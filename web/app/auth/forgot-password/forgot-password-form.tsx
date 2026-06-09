"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { AUTH_FORGOT_SCENE } from "@/features/auth/auth-scenes";
import { getAuthRepository } from "@/features/auth/repository";
import { useAuth } from "@/features/auth/use-auth";

export function ForgotPasswordForm() {
  const { resetPasswordForEmail, isSubmitting, error, clearError, configError } = useAuth();
  const form = useMemo(() => getAuthRepository().getFormPresentation("forgot"), []);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      const ok = await resetPasswordForEmail(email);
      if (ok) setSent(true);
    },
    [resetPasswordForEmail, email, clearError],
  );

  if (sent) {
    return (
      <div className="auth-form-panel auth-status-panel">
        <header className="auth-form-panel__head">
          <span className="auth-form-panel__kicker">{AUTH_FORGOT_SCENE.kicker}</span>
          <h2 className="auth-form-panel__title">Bağlantı gönderildi</h2>
          <p className="auth-form-panel__subtitle">
            E-postanı kontrol et. Birkaç dakika içinde gelmezse spam klasörüne bak.
          </p>
        </header>

        <div className="auth-status-panel__icon" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v1.5H8V10zm0 3h5v1.5H8V13z"
              fill="currentColor"
            />
          </svg>
        </div>

        {email ? (
          <p className="auth-status-panel__email" aria-label="Gönderilen e-posta">
            {email}
          </p>
        ) : null}

        <ul className="auth-status-panel__steps">
          <li className="auth-status-panel__step">
            <span className="auth-status-panel__step-num">1</span>
            Gelen kutunu ve spam klasörünü kontrol et
          </li>
          <li className="auth-status-panel__step">
            <span className="auth-status-panel__step-num">2</span>
            Marketly bağlantısına tıkla
          </li>
          <li className="auth-status-panel__step">
            <span className="auth-status-panel__step-num">3</span>
            Yeni şifreni belirle
          </li>
        </ul>

        <div className="auth-form-panel__actions" style={{ marginTop: 28 }}>
          <Link href="/auth/login" className="auth-form-submit" style={{ textAlign: "center", lineHeight: "50px", textDecoration: "none" }}>
            Girişe dön
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
        <span className="auth-form-panel__kicker">{AUTH_FORGOT_SCENE.kicker}</span>
        <h2 className="auth-form-panel__title">{form.title}</h2>
        <p className="auth-form-panel__subtitle">{form.subtitle}</p>
      </header>

      <form onSubmit={onSubmit} className="auth-form-panel__form">
        <div className="auth-form-panel__fields">
          <div className="auth-form-field">
            <label htmlFor="email">E-posta</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
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
            {isSubmitting ? "Gönderiliyor…" : form.primary_cta}
          </button>

          <div className="auth-form-links">
            <Link href="/auth/login">Girişe dön</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
