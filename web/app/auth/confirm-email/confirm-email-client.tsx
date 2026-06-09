"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AUTH_CONFIRM_SCENE } from "@/features/auth/auth-scenes";
import { useAuth } from "@/features/auth/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type ConfirmStatus = "pending" | "verifying" | "success" | "error";

function hasAuthHash(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  return hash.includes("access_token") || hash.includes("type=signup") || hash.includes("type=email");
}

export function ConfirmEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isInitialized } = useAuth();
  const email = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);
  const [status, setStatus] = useState<ConfirmStatus>("pending");

  useEffect(() => {
    if (!isInitialized) return;

    if (user?.id) {
      setStatus("success");
      const t = setTimeout(() => router.replace("/onboarding/setup"), 1800);
      return () => clearTimeout(t);
    }

    if (!isSupabaseConfigured()) {
      setStatus(email ? "pending" : "error");
      return;
    }

    if (hasAuthHash()) setStatus("verifying");

    const client = getSupabaseBrowserClient();

    const { data: sub } = client.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setStatus("success");
        setTimeout(() => router.replace("/onboarding/setup"), 1800);
      }
    });

    void client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setStatus("success");
        setTimeout(() => router.replace("/onboarding/setup"), 1800);
      } else if (hasAuthHash()) {
        setStatus("verifying");
      } else if (email) {
        setStatus("pending");
      } else {
        setStatus("error");
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [isInitialized, user?.id, email, router]);

  if (status === "verifying") {
    return (
      <div className="auth-form-panel auth-status-panel">
        <header className="auth-form-panel__head">
          <span className="auth-form-panel__kicker">{AUTH_CONFIRM_SCENE.kicker}</span>
          <h2 className="auth-form-panel__title">Doğrulanıyor…</h2>
          <p className="auth-form-panel__subtitle">
            <span className="auth-status-panel__pulse" aria-hidden />
            Hesabın etkinleştiriliyor, lütfen bekle.
          </p>
        </header>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="auth-form-panel auth-status-panel">
        <header className="auth-form-panel__head">
          <span className="auth-form-panel__kicker">{AUTH_CONFIRM_SCENE.kicker}</span>
          <h2 className="auth-form-panel__title">Hesap etkin</h2>
          <p className="auth-form-panel__subtitle">Kuruluma yönlendiriliyorsun.</p>
        </header>

        <div className="auth-status-panel__icon" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor" />
          </svg>
        </div>

        <div className="auth-form-panel__actions" style={{ marginTop: 28 }}>
          <Link
            href="/onboarding/setup"
            className="auth-form-submit"
            style={{ textAlign: "center", lineHeight: "50px", textDecoration: "none" }}
          >
            Kuruluma geç
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="auth-form-panel auth-status-panel">
        <header className="auth-form-panel__head">
          <span className="auth-form-panel__kicker">{AUTH_CONFIRM_SCENE.kicker}</span>
          <h2 className="auth-form-panel__title">Bağlantı geçersiz</h2>
          <p className="auth-form-panel__subtitle">Doğrulama bağlantısı süresi dolmuş veya hatalı olabilir.</p>
        </header>

        <div className="auth-form-panel__actions" style={{ marginTop: 28 }}>
          <Link href="/auth/login" className="auth-form-submit" style={{ textAlign: "center", lineHeight: "50px", textDecoration: "none" }}>
            Giriş yap
          </Link>
          <div className="auth-form-links">
            <Link href="/auth/register">Yeniden kayıt ol</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-panel auth-status-panel">
      <header className="auth-form-panel__head">
        <span className="auth-form-panel__kicker">{AUTH_CONFIRM_SCENE.kicker}</span>
        <h2 className="auth-form-panel__title">E-postanı kontrol et</h2>
        <p className="auth-form-panel__subtitle">Gelen kutundaki bağlantıya tıklayarak hesabını etkinleştir.</p>
      </header>

      <div className="auth-status-panel__icon" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"
            fill="currentColor"
          />
        </svg>
      </div>

      {email ? (
        <p className="auth-status-panel__email" aria-label="Kayıt e-postası">
          {email}
        </p>
      ) : null}

      <ul className="auth-status-panel__steps">
        <li className="auth-status-panel__step">
          <span className="auth-status-panel__step-num">1</span>
          Gelen kutunu aç
        </li>
        <li className="auth-status-panel__step">
          <span className="auth-status-panel__step-num">2</span>
          Marketly doğrulama mailine tıkla
        </li>
        <li className="auth-status-panel__step">
          <span className="auth-status-panel__step-num">3</span>
          Otomatik olarak kuruluma yönlendirilirsin
        </li>
      </ul>

      <div className="auth-form-panel__actions" style={{ marginTop: 28 }}>
        <Link href="/auth/login" className="auth-form-links" style={{ justifyContent: "center", width: "100%" }}>
          Zaten doğruladın mı? <strong style={{ marginLeft: 6 }}>Giriş yap</strong>
        </Link>
      </div>
    </div>
  );
}
