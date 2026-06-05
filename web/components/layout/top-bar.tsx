"use client";

import Link from "next/link";
import { Suspense } from "react";

import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { SidebarBrand } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { TopBarSearch } from "@/components/layout/top-bar-search";
import { useAuth } from "@/features/auth/use-auth";
import { cn } from "@/lib/cn";

type Props = {
  chromeVisible: boolean;
  onOpenMenu: () => void;
  /**
   * Masaüstü: üst çubuğun `left` ofseti — tam yan menü (`sidebar`) veya
   * kapalıyken dar şerit (`rail`). Mobil her zaman tam genişlik.
   */
  mdSidebarGutter?: "sidebar" | "rail";
};

function SearchFallback() {
  return (
    <div
      className="h-10 w-full max-w-[640px] animate-pulse rounded-[var(--radius-chip)] border-0 bg-[var(--color-search-field-bg)]"
      aria-hidden
    />
  );
}

export function TopBar({ chromeVisible, onOpenMenu, mdSidebarGutter = "sidebar" }: Props) {
  const { user, isInitialized } = useAuth();

  return (
    <header
      className={cn(
        "marketly-chrome-header fixed right-0 top-0 z-50 flex shrink-0 flex-col bg-[color-mix(in_srgb,var(--color-topbar)_92%,transparent)] pt-[env(safe-area-inset-top,0px)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out",
        "left-0 right-0 md:right-0",
        mdSidebarGutter === "rail" ? "md:left-[var(--sidebar-rail-width)]" : "md:left-[var(--sidebar-width)]",
        !chromeVisible && "-translate-y-full pointer-events-none",
      )}
    >
      <div className="flex h-[var(--topbar-height)] w-full min-w-0 shrink-0 items-center ps-[max(var(--sp-2),env(safe-area-inset-left))] pe-[max(var(--sp-2),env(safe-area-inset-right))]">
        {/* Sol: mobil menü + kompakt marka (masaüstü marka yan menüde) */}
        <div className="flex min-w-0 shrink-0 items-center gap-[var(--sp-1)] ps-[var(--sp-1)] md:ps-[var(--sp-2)]">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)] active:scale-[0.985] md:hidden"
          aria-label="Menüyü aç"
          onClick={onOpenMenu}
        >
          <span className="sr-only">Menü</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0 md:hidden">
          <SidebarBrand compact className="border-0 bg-transparent" />
        </div>
      </div>

      {/* Orta: arama */}
      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center px-[var(--sp-2)] md:px-[var(--sp-4)]">
        <div className="flex w-full min-w-0 max-w-[640px] items-center">
          <Suspense fallback={<SearchFallback />}>
            <TopBarSearch />
          </Suspense>
        </div>
      </div>

      {/* Sağ: hesap ve eylemler */}
      <nav
        className="flex h-full shrink-0 items-center gap-px sm:gap-[var(--sp-1)] pe-[var(--sp-2)] md:pe-[var(--sp-3)]"
        aria-label="Hesap"
      >
        <ThemeToggle />
        <Link
          href="/upload"
          className="hidden h-9 items-center gap-[var(--sp-2)] rounded-full border border-[var(--color-border)] bg-transparent px-[var(--sp-3)] text-[14px] font-semibold leading-none text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)] active:scale-[0.98] sm:inline-flex"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          <span>Oluştur</span>
        </Link>
        <Link
          href="/upload"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-transparent text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)] active:scale-[0.98] sm:hidden"
          aria-label="İçerik oluştur"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </Link>
        <NotificationsDropdown />
        {!isInitialized ? (
          <div className="h-9 w-20 animate-pulse rounded-full bg-[var(--color-surface-muted)]" aria-hidden />
        ) : user ? (
          <UserMenu />
        ) : (
          <>
            <Link
              href="/auth/login"
              className="rounded-full px-[var(--sp-3)] py-2 text-[14px] font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              Giriş
            </Link>
            <Link
              href="/auth/register"
              className="hidden rounded-full border border-[var(--color-border)] bg-transparent px-[var(--sp-3)] py-2 text-[14px] font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)] sm:inline-block"
            >
              Kayıt ol
            </Link>
          </>
        )}
      </nav>
      </div>
    </header>
  );
}
