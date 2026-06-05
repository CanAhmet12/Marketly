/**
 * COMING SOON STATE
 * 
 * For placeholder pages / features in development
 * Premium placeholder (not amateur "under construction")
 */

import Link from "next/link";

type Props = {
  /** Feature title */
  title: string;
  /** Description */
  description?: string;
  /** Roadmap hint */
  roadmapHint?: string;
  /** Back to home link */
  showBackLink?: boolean;
};

function RocketIcon() {
  return (
    <div
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-tier-pro)_20%,transparent)] to-[var(--color-surface-muted)] shadow-sm"
      aria-hidden
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-[var(--color-tier-pro)]"
      >
        <path d="M12 2v20M19 5l-7 7-7-7M19 19l-7-7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function ComingSoonState({
  title,
  description = "Bu özellik şu anda geliştirme aşamasında. Çok yakında burada olacak!",
  roadmapHint,
  showBackLink = true,
}: Props) {
  return (
    <div
      className="motion-fade-in rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-tier-pro)_8%,transparent)] to-[var(--color-surface)] px-6 py-12 text-center shadow-sm sm:px-10"
      role="status"
    >
      <RocketIcon />

      <div className="mt-6 flex items-center justify-center gap-2">
        <h2 className="text-[var(--type-page)] font-bold text-[var(--color-text)]">
          {title}
        </h2>
        <span className="rounded-full bg-[color-mix(in_srgb,var(--color-tier-pro)_14%,transparent)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-tier-pro)]">
          Yakında
        </span>
      </div>

      <p className="mx-auto mt-3 max-w-lg text-[var(--type-meta)] leading-relaxed text-[var(--color-muted)]">
        {description}
      </p>

      {roadmapHint && (
        <p className="mt-4 text-[12px] font-semibold text-[var(--color-meta)]">
          {roadmapHint}
        </p>
      )}

      {showBackLink && (
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-[var(--type-chip)] font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
        >
          Ana sayfaya dön
        </Link>
      )}
    </div>
  );
}
