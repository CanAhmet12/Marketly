"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { getAuthRepository } from "@/features/auth/repository";
import { useAuth } from "@/features/auth/use-auth";
import { getOnboardingRepository } from "@/features/onboarding/repository";
import { safeInternalNextPath } from "@/lib/auth/safe-next-path";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isSubmitting, error, clearError, configError } = useAuth();
  const form = useMemo(() => getAuthRepository().getFormPresentation("login"), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const nextQ = useMemo(() => {
    const raw = searchParams.get("next");
    if (!raw?.trim()) return "";
    return `?next=${encodeURIComponent(safeInternalNextPath(raw))}`;
  }, [searchParams]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      const ok = await signIn(email, password);
      if (!ok) return;
      const explicitNext = searchParams.get("next");
      const resolved = safeInternalNextPath(explicitNext);
      const onboarding = getOnboardingRepository();
      const wantsDefaultHome = !explicitNext || resolved === "/";
      const target = wantsDefaultHome && onboarding.needsOnboarding() ? "/onboarding" : resolved;
      router.replace(target);
      router.refresh();
    },
    [signIn, email, password, clearError, router, searchParams],
  );

  return (
    <div className="w-full max-w-[400px]">
      {configError ? (
        <div role="alert" className="mb-3 rounded-[12px] border border-amber-200/90 bg-amber-50 px-3 py-2.5 text-[13px] font-medium text-amber-950">
          {configError}
        </div>
      ) : null}
      <div className="rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_90%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-4)] shadow-[var(--shadow-card)] min-[480px]:px-[var(--sp-4)]">
        <h1 className="text-[20px] font-bold tracking-tight text-[var(--color-text)]">{form.title}</h1>
        <p className="mt-1 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">{form.subtitle}</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <div>
            <label htmlFor="email" className="mb-1 block text-[12px] font-bold text-[var(--color-text)]">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[14px] font-medium text-[var(--color-text)] outline-none ring-[var(--color-primary-dark)] transition-shadow focus:ring-2"
              placeholder="ornek@email.com"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-[12px] font-bold text-[var(--color-text)]">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[14px] font-medium text-[var(--color-text)] outline-none ring-[var(--color-primary-dark)] transition-shadow focus:ring-2"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
          </div>

          {error ? (
            <div role="alert" aria-live="assertive" className="rounded-[10px] bg-red-50 px-3 py-2 text-[13px] font-medium text-red-900">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="mt-1 flex h-10 items-center justify-center rounded-[10px] bg-[var(--color-text)] text-[13px] font-bold text-[var(--color-surface)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSubmitting ? "Giriş yapılıyor…" : form.primary_cta}
          </button>
        </form>

        {form.secondary_hint ? <p className="mt-3 text-center text-[11px] font-medium text-[var(--color-meta)]">{form.secondary_hint}</p> : null}

        <div className="mt-5 flex flex-col gap-2 text-center text-[13px] font-medium text-[var(--color-text-secondary)]">
          <Link href={`/auth/forgot-password${nextQ}`} className="font-bold text-[var(--color-text)] hover:underline">
            Şifreni mi unuttun?
          </Link>
          <p>
            Hesabın yok mu?{" "}
            <Link href={`/auth/register${nextQ}`} className="font-bold text-[var(--color-text)] hover:underline">
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
