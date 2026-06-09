"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { useAuth } from "@/features/auth/use-auth";
import { cn } from "@/lib/cn";
import { openNotificationsPanel } from "@/lib/notifications-panel-bridge";

function MenuDivider() {
  return <div className="my-1 h-px bg-[var(--color-divider)]" />;
}

function menuItemClass() {
  return "flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-[var(--color-text)] transition duration-[var(--motion-fast)] hover:bg-[var(--color-surface-hover)]";
}

export function UserMenu() {
  const { user, signOut, isInitialized } = useAuth();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const onSignOut = useCallback(async () => {
    setOpen(false);
    await signOut();
  }, [signOut]);

  if (!isInitialized) {
    return <div className="h-9 w-28 animate-pulse rounded-full bg-[var(--color-surface-muted)]" aria-hidden />;
  }

  if (!user) {
    return null;
  }

  const initial = (user.displayName || user.email).slice(0, 1).toUpperCase();
  const mi = menuItemClass();

  return (
    <div className="relative">
      <button
        type="button"
        className="flex max-w-[11rem] items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-1 pl-1 pr-2.5 text-left text-sm font-semibold text-[var(--color-text)] shadow-[var(--shadow-card)] transition duration-[var(--motion-fast)] hover:border-[color-mix(in_srgb,var(--color-primary)_35%,var(--color-border))] hover:bg-[var(--color-surface-hover)] active:scale-[0.98]"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Hesap menüsü"
        onClick={() => setOpen((v) => !v)}
      >
        {user.avatarUrl ? (
          <SafeAvatar
            src={user.avatarUrl}
            alt={`${user.displayName || user.email} profil fotoğrafı`}
            size={32}
            className="h-8 w-8 shrink-0 rounded-full border border-[var(--color-border)]"
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-semibold text-[var(--color-primary-dark)]">
            {initial}
          </span>
        )}
        <span className="truncate">{user.displayName || "Hesabım"}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-muted)]" aria-hidden>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <>
          {open && typeof document !== "undefined"
            ? createPortal(
                <button
                  type="button"
                  className="marketly-dismiss-layer"
                  aria-label="Menüyü kapat"
                  onClick={close}
                />,
                document.body,
              )
            : null}
          <div
            role="menu"
            className="absolute right-0 z-[60] mt-2 max-h-[min(85vh,520px)] w-64 overflow-y-auto overflow-x-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-dropdown)] ring-1 ring-black/20"
          >
            <div className="border-b border-[var(--color-divider)] bg-[var(--color-surface-muted)] px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-[var(--color-text)]">{user.displayName || "Kullanıcı"}</p>
              <p className="truncate text-xs text-[var(--color-muted)]">{user.email}</p>
            </div>

            <Link href="/hub/profile" role="menuitem" className={mi} onClick={close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0 text-[var(--color-muted)]" aria-hidden>
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <circle cx="12" cy="11" r="3" />
                <path d="M8 21h8" strokeLinecap="round" />
              </svg>
              Kanalım
            </Link>

            <MenuDivider />
            <button
              type="button"
              role="menuitem"
              className={cn(mi, "w-full text-left")}
              onClick={() => {
                close();
                openNotificationsPanel();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0 text-[var(--color-muted)]" aria-hidden>
                <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" strokeLinejoin="round" />
              </svg>
              Bildirimler
            </button>
            <Link href="/hub/messages" role="menuitem" className={mi} onClick={close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0 text-[var(--color-muted)]" aria-hidden>
                <path d="M4 6h16v10H9l-5 4V6Z" strokeLinejoin="round" />
              </svg>
              Mesajlar
            </Link>

            <MenuDivider />
            <Link href="/studio" role="menuitem" className={mi} onClick={close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0 text-[var(--color-muted)]" aria-hidden>
                <rect x="3" y="5" width="14" height="12" rx="2" />
                <path d="M10 10v4M7 15h10" strokeLinecap="round" />
              </svg>
              Creator Studio
            </Link>

            <MenuDivider />
            <Link href="/hub/settings" role="menuitem" className={mi} onClick={close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0 text-[var(--color-muted)]" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
              </svg>
              Ayarlar
            </Link>

            <MenuDivider />
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2.5 text-left text-sm font-semibold text-red-400 transition duration-[var(--motion-fast)] hover:bg-red-500/10"
              onClick={() => void onSignOut()}
            >
              Çıkış yap
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
