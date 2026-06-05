/**
 * GLOBAL ERROR STATE COMPONENT
 * 
 * Philosophy:
 * - No panic
 * - User-friendly messages
 * - Retry action available
 * - Debug info optional (dev mode)
 */

type Props = {
  /** User-friendly title */
  title?: string;
  /** User-friendly description */
  description?: string;
  /** Retry button label */
  retryLabel?: string;
  /** Retry handler */
  onRetry?: () => void;
  /** Support hint */
  supportHint?: string;
  /** Debug message (optional, for dev mode) */
  debugMessage?: string;
  /** Show debug info */
  showDebug?: boolean;
  /** Compact mode (smaller padding) */
  compact?: boolean;
};

function ErrorIcon() {
  return (
    <div
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
      aria-hidden
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[var(--color-danger)]"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function ErrorState({
  title = "Bir şeyler ters gitti",
  description = "İçerik yüklenirken bir sorun oluştu. Lütfen tekrar dene.",
  retryLabel = "Tekrar dene",
  onRetry,
  supportHint,
  debugMessage,
  showDebug = false,
  compact = false,
}: Props) {
  return (
    <div
      className={`motion-fade-in rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-danger)_5%,var(--color-surface))] text-center shadow-sm ${compact ? "px-4 py-8" : "px-6 py-10"}`}
      role="alert"
      aria-live="assertive"
    >
      <ErrorIcon />

      <h2 className="mt-4 text-[var(--type-content-title)] font-bold text-[var(--color-text)]">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-[var(--type-meta)] leading-relaxed text-[var(--color-text-secondary)]">
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-danger)] px-5 py-2.5 text-[var(--type-chip)] font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {retryLabel}
        </button>
      )}

      {supportHint && (
        <p className="mt-4 text-[11px] text-[var(--color-meta)]">
          {supportHint}
        </p>
      )}

      {showDebug && debugMessage && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)] hover:text-[var(--color-text)]">
            Debug bilgisi
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-[10px] text-[var(--color-meta)]">
            {debugMessage}
          </pre>
        </details>
      )}
    </div>
  );
}
