"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AuthBrandPanel } from "./auth-brand-panel";
import { resolveAuthScene } from "./auth-scenes";

const PREMIUM_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/update-password",
  "/auth/confirm-email",
];

export function AuthLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isPremium = PREMIUM_PATHS.some((p) => pathname.startsWith(p));

  if (!isPremium) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <header className="border-b border-[color-mix(in_srgb,var(--color-border)_90%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-3)]">
          <Link href="/" className="text-[15px] font-bold tracking-tight text-[var(--color-text)] hover:text-[var(--color-primary-dark)]">
            ← Marketly
          </Link>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-[var(--sp-3)] py-[var(--sp-4)]">{children}</main>
      </div>
    );
  }

  const scene = resolveAuthScene(pathname);

  return (
    <div
      className="auth-split"
      data-scene={scene.id}
      style={
        {
          "--auth-accent": scene.accent,
          "--auth-accent-2": scene.accent2,
          "--auth-panel-bg": scene.panelBg,
        } as React.CSSProperties
      }
    >
      <div className="auth-split__bg" aria-hidden>
        <div className="auth-split__grid" />
        <div className="auth-split__glow auth-split__glow--1" />
        <div className="auth-split__glow auth-split__glow--2" />
        <div className="auth-split__grain" />
      </div>

      <header className="auth-split__topbar">
        <Link href="/" className="auth-split__brand">
          <span className="auth-split__brand-mark">
            <img src="/logo.png" alt="" width={60} height={60} className="auth-split__logo" />
            <span className="auth-split__brand-ring" aria-hidden />
          </span>
          <span className="auth-split__brand-text">
            <span className="auth-split__brand-name">Marketly</span>
            <span className="auth-split__brand-tag">Finans sosyal platformu</span>
          </span>
        </Link>
        <Link href="/discover" className="auth-split__discover">
          Keşfet →
        </Link>
      </header>

      <div key={scene.id} className="auth-split__stage auth-scene-enter">
        <aside className="auth-split__brand-col">
          <AuthBrandPanel scene={scene} />
        </aside>

        <main className="auth-split__main">
          <div className="auth-split__form-area">{children}</div>
        </main>
      </div>

      <footer className="auth-split__footer">
        <span>© Marketly</span>
        <Link href="/discover">Misafir olarak gez</Link>
      </footer>
    </div>
  );
}
