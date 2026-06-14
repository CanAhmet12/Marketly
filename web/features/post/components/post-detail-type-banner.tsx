"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import type { PostDetailShellHint } from "../post-detail-helpers";

type Props = {
  postId: string;
  hint: PostDetailShellHint;
};

function dismissKey(postId: string) {
  return `pd-shell-dismiss:${postId}`;
}

function ShellIcon({ kind }: { kind: PostDetailShellHint["kind"] }) {
  if (kind === "live") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "pulse") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 8v8M8 5v14M12 8v8M16 6v12M20 9v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

export function PostDetailTypeBanner({ postId, hint }: Props) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(dismissKey(postId)) === "1");
    } catch {
      /* yok */
    }
  }, [postId]);

  const onDismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem(dismissKey(postId), "1");
    } catch {
      /* yok */
    }
  }, [postId]);

  if (dismissed) return null;

  return (
    <aside
      className={cn("pd-type-shell-banner", `pd-type-shell-banner--${hint.kind}`)}
      role="note"
      aria-label={hint.title}
    >
      <span className="pd-type-shell-banner__icon" aria-hidden>
        <ShellIcon kind={hint.kind} />
      </span>
      <div className="pd-type-shell-banner__copy">
        <p className="pd-type-shell-banner__title">{hint.title}</p>
        <p className="pd-type-shell-banner__desc">{hint.description}</p>
      </div>
      <Link href={hint.href} className="pd-type-shell-banner__cta">
        {hint.cta}
      </Link>
      <button
        type="button"
        className="pd-type-shell-banner__dismiss"
        aria-label="Bildirimi kapat"
        onClick={onDismiss}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </aside>
  );
}

export function postDetailShellCanvasClass(hint: PostDetailShellHint | null): string {
  if (!hint) return "";
  return ` pd-canvas--shell-${hint.kind}`;
}
