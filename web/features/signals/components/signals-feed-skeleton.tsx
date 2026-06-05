"use client";

export function SignalsFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-[var(--sp-3)] p-0" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="overflow-hidden rounded-[var(--ms-card-radius)] bg-[var(--ms-card-surface)] p-[var(--sp-3)] shadow-[var(--ms-shadow-1)] ring-1 ring-[var(--ms-border-hairline)]"
        >
          <div className="flex gap-[var(--sp-3)]">
            <div className="motion-shimmer h-20 w-20 shrink-0 rounded-full bg-[var(--color-divider)]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="motion-shimmer h-4 w-28 rounded bg-[var(--color-divider)]" />
              <div className="motion-shimmer h-3 w-full rounded bg-[var(--color-divider)]" />
              <div className="motion-shimmer h-3 w-[80%] rounded bg-[var(--color-divider)]" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** `/signals` SSR Suspense + ilk yükleme fallback */
export function SignalsPageSkeleton() {
  return (
    <div className="sp-canvas ms-page-wrapper ms-container-markets min-w-0" aria-busy="true">
      <div className="sp-hero sp-hero--compact motion-shimmer" style={{ minHeight: 100 }} />
      <div className="motion-shimmer mx-0 mb-4 h-14 w-full max-w-2xl rounded-xl bg-[var(--color-divider)]" />
      <SignalsFeedSkeleton count={4} />
    </div>
  );
}
