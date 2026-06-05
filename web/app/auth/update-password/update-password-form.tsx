"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

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
        setTimeout(() => router.replace("/auth/login"), 2000);
      }
    },
    [updatePassword, password, clearError, router],
  );

  if (!isInitialized) {
    return <AuthFormSkeleton />;
  }

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

        {done ? (
          <p className="mt-5 text-[13px] font-medium text-emerald-900" role="status">
            Şifren güncellendi. Giriş sayfasına yönlendiriliyorsun.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
            <div>
              <label htmlFor="password" className="mb-1 block text-[12px] font-bold text-[var(--color-text)]">
                Yeni şifre
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[14px] font-medium text-[var(--color-text)] outline-none ring-[var(--color-primary-dark)] focus:ring-2"
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
              className="flex h-10 items-center justify-center rounded-[10px] bg-[var(--color-text)] text-[13px] font-bold text-[var(--color-surface)] transition-opacity hover:opacity-90 disabled:opacity-55"
            >
              {isSubmitting ? "Kaydediliyor…" : form.primary_cta}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-[13px] font-medium">
          <Link href="/auth/login" className="font-bold text-[var(--color-text)] hover:underline">
            Girişe dön
          </Link>
        </p>
      </div>
    </div>
  );
}
