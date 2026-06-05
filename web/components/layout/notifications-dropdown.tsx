"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { getNotificationsRepository } from "@/features/notifications/repository";
import { useAuth } from "@/features/auth/use-auth";
import { effectiveReadAt, useNotificationInbox } from "@/features/social/hooks/use-notification-inbox";
import { formatSocialRelativeTime, getNotificationKindLabel } from "@/features/social/lib/social-format";
import type { MockNotificationType } from "@/features/social/types";
import { registerNotificationsPanelOpener } from "@/lib/notifications-panel-bridge";
import { cn } from "@/lib/cn";

const PANEL_MAX = 8;

export function NotificationsDropdown() {
  const { user, isInitialized } = useAuth();
  const uid = user?.id;
  const snap = usePersonalizationSnapshot();
  const { unreadCount, markRead, markAllRead, overrides, hydrated } = useNotificationInbox(uid);

  const previewItems = useMemo(() => {
    void snap.feedbackRev;
    void snap.adaptiveRev;
    void snap.explorationRev;
    void snap.recommendRev;
    void snap.watchRev;
    if (!uid) return [];
    return getNotificationsRepository().getInboxPreview(uid, PANEL_MAX);
  }, [uid, snap.feedbackRev, snap.adaptiveRev, snap.explorationRev, snap.recommendRev, snap.watchRev]);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 56, right: 16 });

  const updatePos = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.bottom + 8,
      right: Math.max(12, document.documentElement.clientWidth - r.right),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    const onResize = () => updatePos();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, updatePos]);

  useEffect(() => {
    return registerNotificationsPanelOpener(() => {
      updatePos();
      setOpen(true);
    });
  }, [updatePos]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const preview = previewItems;

  if (!isInitialized || !user) {
    return (
      <div className="hidden h-10 w-10 shrink-0 rounded-full bg-[var(--color-surface-muted)] md:block" aria-hidden />
    );
  }

  return (
    <div className="relative hidden md:block">
      <button
        ref={anchorRef}
        type="button"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] active:scale-[0.98]"
        title="Bildirimler"
        aria-label="Bildirimler"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen((v) => !v);
          requestAnimationFrame(updatePos);
        }}
      >
        <span className="relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" strokeLinejoin="round" />
          </svg>
            {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_22%,var(--color-surface))] px-0.5 text-[9px] font-bold leading-none text-[var(--color-primary-dark)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_35%,transparent)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </span>
      </button>

      {open ? (
        <>
          {open && typeof document !== "undefined"
            ? createPortal(
                <button type="button" className="marketly-dismiss-layer" aria-label="Kapat" onClick={close} />,
                document.body,
              )
            : null}
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Bildirimler"
            className={cn(
              "fixed z-[60] flex w-[min(calc(100vw-2rem),22rem)] max-w-[calc(100vw-2rem)] origin-top flex-col overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] motion-safe:animate-[marketly-popover-in_0.22s_ease-out]",
            )}
            style={{ top: pos.top, right: pos.right }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[var(--color-divider)] px-[var(--sp-3)] py-[var(--sp-2)]">
              <div>
                <p className="text-[15px] font-bold text-[var(--color-text)]">Bildirimler</p>
                <p className="text-[11px] font-medium text-[var(--color-meta)]">
                  {hydrated ? `${unreadCount} okunmamış` : "…"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={!hydrated || unreadCount === 0}
                  onClick={() => void markAllRead()}
                  className="rounded-full px-2 py-1 text-[11px] font-bold text-[var(--color-primary-dark)] transition enabled:hover:bg-[var(--color-primary-light)] disabled:opacity-40"
                >
                  Tümünü oku
                </button>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                  aria-label="Kapat"
                  onClick={close}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[min(60vh,420px)] min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain px-1 py-1">
              {preview.length === 0 ? (
                <p className="px-3 py-8 text-center text-[13px] font-medium text-[var(--color-muted)]">Henüz olay yok.</p>
              ) : (
                <ul className="m-0 list-none p-0">
                  {preview.map((item) => {
                    const n = item.row;
                    const read = Boolean(effectiveReadAt(n, overrides));
                    return (
                      <li key={n.id} className="border-b border-[var(--color-divider)] last:border-0">
                        <Link
                          href={n.action_href}
                          onClick={() => {
                            markRead(n.id);
                            close();
                          }}
                          className={cn(
                            "flex min-w-0 gap-2.5 rounded-lg px-2 py-2 transition hover:bg-[var(--color-surface-hover)]",
                            !read && "bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]",
                          )}
                        >
                          <div className="relative shrink-0">
                            {n.actor_avatar_url ? (
                              <SafeAvatar src={n.actor_avatar_url} alt="" size={36} className="h-9 w-9 shrink-0 rounded-full" />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-[12px] font-bold text-[var(--color-text)]">
                                {n.actor_display.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">{getNotificationKindLabel(n.type as MockNotificationType)}</p>
                              {item.starred ? <span className="text-[9px] font-bold text-[var(--color-primary-dark)]">Önemli</span> : null}
                              {!read ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" aria-hidden /> : null}
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--color-text)]">{n.title}</p>
                            {item.relevance_line ? (
                              <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-[var(--color-text-secondary)]">{item.relevance_line}</p>
                            ) : null}
                            <p className="mt-0.5 text-[11px] font-medium tabular-nums text-[var(--color-muted)]">{formatSocialRelativeTime(n.created_at)}</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-[var(--color-divider)] bg-[var(--color-surface-muted)] px-2 py-2">
              <Link
                href="/notifications"
                onClick={close}
                className="block rounded-lg py-2 text-center text-[13px] font-bold text-[var(--color-primary-dark)] transition hover:bg-[var(--color-surface-hover)]"
              >
                Tüm bildirimleri gör
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
