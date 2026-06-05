"use client";

import Link from "next/link";

import { AppErrorView } from "@/components/errors/app-error-view";

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <AppErrorView error={error} reset={reset} variant="card" />
      <Link href="/auth/login" className="mt-6 text-sm font-semibold text-[var(--color-primary-dark)] hover:underline">
        Giriş sayfasına dön
      </Link>
    </div>
  );
}
