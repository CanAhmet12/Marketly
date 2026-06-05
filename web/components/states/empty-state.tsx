/**
 * GLOBAL EMPTY STATE COMPONENT
 * 
 * Philosophy:
 * - "Ürün hazır, şu anda veri yok" hissi
 * - Premium, calm, informative
 * - Action-oriented
 * - NOT "feature eksik" hissi
 */

import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "neutral" | "market" | "social" | "creator" | "warning";

type Props = {
  /** Icon element (optional, SVG recommended) */
  icon?: ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action label */
  actionLabel?: string;
  /** Primary action href */
  actionHref?: string;
  /** Primary action handler (if not href) */
  onAction?: () => void;
  /** Secondary action label */
  secondaryActionLabel?: string;
  /** Secondary action href */
  secondaryActionHref?: string;
  /** Tone variant */
  tone?: Tone;
  /** Compact mode (smaller padding, no icon) */
  compact?: boolean;
};

function toneGradient(tone: Tone): string {
  switch (tone) {
    case "market":
      return "from-[var(--color-rise-light)] to-[var(--color-surface-muted)]";
    case "social":
      return "from-[var(--color-primary-light)] to-[var(--color-surface-muted)]";
    case "creator":
      return "from-[color-mix(in_srgb,var(--color-tier-pro)_20%,transparent)] to-[var(--color-surface-muted)]";
    case "warning":
      return "from-[color-mix(in_srgb,var(--color-danger)_15%,transparent)] to-[var(--color-surface-muted)]";
    default:
      return "from-[var(--color-surface-muted)] to-[var(--color-surface)]";
  }
}

function DefaultIcon() {
  return (
    <div
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-surface-muted)] shadow-sm"
      aria-hidden
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-[var(--color-primary-dark)]"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 13h4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  tone = "neutral",
  compact = false,
}: Props) {
  return (
    <div
      className={`motion-fade-in rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-gradient-to-br ${toneGradient(tone)} text-center shadow-sm ${compact ? "px-6 py-8" : "px-6 py-12 sm:px-10"}`}
      role="status"
      aria-live="polite"
    >
      {!compact && (icon || <DefaultIcon />)}

      <h2
        className={`${compact ? "mt-0" : "mt-6"} text-[var(--type-content-title)] font-bold text-[var(--color-text)]`}
      >
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-2 max-w-md text-[var(--type-meta)] leading-relaxed text-[var(--color-muted)]">
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel &&
            (actionHref ? (
              <Link
                href={actionHref}
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 py-2.5 text-[var(--type-chip)] font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                {actionLabel}
              </Link>
            ) : onAction ? (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 py-2.5 text-[var(--type-chip)] font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                {actionLabel}
              </button>
            ) : null)}

          {secondaryActionLabel && secondaryActionHref && (
            <Link
              href={secondaryActionHref}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-[var(--type-chip)] font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              {secondaryActionLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
