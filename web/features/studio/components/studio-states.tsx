"use client";

import { SkeletonList } from "@/components/states";

/** RequireAuth oturum kontrolü */
export function RequireAuthSkeleton() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
      <div className="w-full max-w-md space-y-3">
        <div className="motion-shimmer mx-auto h-4 w-32 rounded bg-[var(--color-divider)]" />
        <div className="motion-shimmer h-24 w-full rounded-xl bg-[var(--color-divider)]" />
      </div>
    </div>
  );
}

/** Alt sayfa iç yükleme (route Suspense dışı) */
export function StudioSubpageSkeleton() {
  return (
    <div className="studio-page" aria-busy="true">
      <div className="motion-shimmer mb-4 h-6 w-40 rounded bg-[var(--color-divider)]" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="motion-shimmer h-24 rounded-xl bg-[var(--color-divider)]" />
        ))}
      </div>
      <div className="motion-shimmer mt-5 h-36 w-full rounded-xl bg-[var(--color-divider)]" />
    </div>
  );
}

/** Studio sayfa içeriği loading */
export function StudioPageSkeleton() {
  return (
    <div className="studio-page px-6 py-6" aria-busy="true">
      <div className="motion-shimmer mb-4 h-7 w-48 rounded bg-[var(--color-divider)]" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="motion-shimmer h-20 rounded-xl bg-[var(--color-divider)]" />
        ))}
      </div>
      <div className="motion-shimmer mt-6 h-40 w-full rounded-xl bg-[var(--color-divider)]" />
      <div className="mt-6">
        <SkeletonList count={4} />
      </div>
    </div>
  );
}

/** `/upload` loading */
export function UploadPageSkeleton() {
  return (
    <div className="ms-page-wrapper ms-container-standard min-w-0 py-8" aria-busy="true">
      <div className="motion-shimmer mb-4 h-7 w-40 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-4 h-10 w-full max-w-xl rounded-full bg-[var(--color-divider)]" />
      <div className="motion-shimmer h-56 w-full rounded-2xl bg-[var(--color-divider)]" />
    </div>
  );
}

/** `/onboarding` loading */
export function OnboardingPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[520px] px-[var(--sp-3)] py-[var(--sp-6)]" aria-busy="true">
      <div className="motion-shimmer mb-3 h-4 w-24 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-6 h-6 w-56 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer h-48 w-full rounded-xl bg-[var(--color-divider)]" />
    </div>
  );
}
