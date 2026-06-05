"use client";

/** Auth form Suspense fallback */
export function AuthFormSkeleton() {
  return (
    <div className="w-full max-w-[400px]" aria-busy="true">
      <div className="rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_90%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-4)] shadow-[var(--shadow-card)]">
        <div className="motion-shimmer h-7 w-52 rounded bg-[var(--color-divider)]" />
        <div className="motion-shimmer mt-6 h-10 w-full rounded-[10px] bg-[var(--color-divider)]" />
        <div className="motion-shimmer mt-3 h-10 w-full rounded-[10px] bg-[var(--color-divider)]" />
        <div className="motion-shimmer mt-4 h-10 w-full rounded-[10px] bg-[var(--color-divider)]" />
      </div>
    </div>
  );
}
