/**
 * NO RESULTS STATE
 * 
 * For search/filter results (different from empty data)
 * "Sonuç yok" vs "Veri yok"
 */

import Link from "next/link";

type Props = {
  /** Query or filter that returned no results */
  query?: string;
  /** Suggestion text */
  suggestion?: string;
  /** Clear filters label */
  clearLabel?: string;
  /** Clear filters handler */
  onClear?: () => void;
  /** Explore alternative href */
  exploreHref?: string;
  /** Explore alternative label */
  exploreLabel?: string;
  /** Compact mode (smaller padding) */
  compact?: boolean;
};

function SearchIcon() {
  return (
    <div
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-muted)]"
      aria-hidden
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[var(--color-meta)]"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function NoResultsState({
  query,
  suggestion = "Farklı kelimeler dene veya filtreleri temizle.",
  clearLabel = "Filtreleri temizle",
  onClear,
  exploreHref,
  exploreLabel = "Keşfet",
  compact = false,
}: Props) {
  return (
    <div
      className={`motion-fade-in flex flex-col items-center justify-center text-center ${compact ? "px-4 py-8" : "px-6 py-12"}`}
      role="status"
      aria-live="polite"
    >
      <SearchIcon />

      <h2 className="mt-4 text-[var(--type-content-title)] font-bold text-[var(--color-text)]">
        {query ? `"${query}" için sonuç bulunamadı` : "Sonuç bulunamadı"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-[var(--type-meta)] leading-relaxed text-[var(--color-muted)]">
        {suggestion}
      </p>

      {(onClear || exploreHref) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-[var(--type-chip)] font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              {clearLabel}
            </button>
          )}

          {exploreHref && (
            <Link
              href={exploreHref}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 py-2.5 text-[var(--type-chip)] font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              {exploreLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
