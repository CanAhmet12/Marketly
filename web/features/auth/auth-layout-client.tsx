"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { getAuthRepository } from "@/features/auth/repository";

export function AuthLayoutClient({ children }: { children: ReactNode }) {
  const shell = getAuthRepository().getShellPresentation();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[color-mix(in_srgb,var(--color-border)_90%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-3)] min-[480px]:px-[var(--sp-4)]">
        <div className="mx-auto flex max-w-[960px] flex-col gap-2 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
          <div className="min-w-0">
            <Link href="/" className="text-[15px] font-bold tracking-tight text-[var(--color-text)] hover:text-[var(--color-primary-dark)]">
              ← {shell.brand_line}
            </Link>
            <p className="mt-1 max-w-[28rem] text-[11px] font-medium leading-snug text-[var(--color-text-secondary)]">{shell.ethos_line}</p>
          </div>
          <nav className="flex flex-wrap gap-1" aria-label="Hızlı bağlantılar">
            {shell.cross_links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-[var(--sp-3)] py-[var(--sp-4)] min-[480px]:px-[var(--sp-4)] min-[480px]:py-[var(--sp-6)]">{children}</main>
      {shell.foot_note ? (
        <footer className="border-t border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-2 text-center text-[10px] font-medium text-[var(--color-meta)] min-[480px]:px-[var(--sp-4)]">
          {shell.foot_note}
        </footer>
      ) : null}
    </div>
  );
}
