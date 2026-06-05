"use client";

import { SkeletonList } from "@/components/states";

/** `/messages` inbox loading */
export function MessagesPageSkeleton() {
  return (
    <div className="msg-canvas msg-shell ms-container-wide min-w-0" aria-busy="true">
      <aside className="msg-sidebar hidden min-[800px]:flex">
        <div className="msg-sidebar-head">
          <div className="motion-shimmer mb-2 h-5 w-32 rounded bg-[var(--color-divider)]" />
          <div className="motion-shimmer mb-3 h-9 w-full rounded-lg bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-8 w-full rounded-full bg-[var(--color-divider)]" />
        </div>
        <div className="p-3">
          <SkeletonList count={5} />
        </div>
      </aside>
      <section className="msg-thread hidden min-[800px]:flex">
        <div className="motion-shimmer m-auto h-24 w-48 rounded-xl bg-[var(--color-divider)]" />
      </section>
    </div>
  );
}

/** `/notifications` loading */
export function NotificationsPageSkeleton() {
  return (
    <div className="ms-page-wrapper ms-container-standard min-w-0 py-4" aria-busy="true">
      <div className="motion-shimmer mb-2 h-6 w-40 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-4 h-4 w-64 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-4 h-9 w-full max-w-xl rounded-full bg-[var(--color-divider)]" />
      <SkeletonList count={6} />
    </div>
  );
}

/** `/subscriptions` hub loading */
export function SubscriptionsPageSkeleton() {
  return (
    <div className="ms-page-wrapper ms-container-standard min-w-0 pb-10 pt-6" aria-busy="true">
      <div className="motion-shimmer mb-2 h-4 w-28 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-3 h-7 w-56 max-w-full rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-6 h-4 w-full max-w-md rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-4 h-9 w-full max-w-sm rounded-full bg-[var(--color-divider)]" />
      <SkeletonList count={4} />
    </div>
  );
}

/** `/subscriptions/[creatorId]` loading */
export function MembershipDetailSkeleton() {
  return (
    <div className="ms-page-wrapper ms-container-standard min-w-0 pb-12 pt-6" aria-busy="true">
      <div className="flex gap-4">
        <div className="motion-shimmer h-16 w-16 shrink-0 rounded-full bg-[var(--color-divider)]" />
        <div className="flex-1 space-y-2">
          <div className="motion-shimmer h-4 w-24 rounded bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-6 w-40 rounded bg-[var(--color-divider)]" />
        </div>
      </div>
      <div className="motion-shimmer mt-8 h-32 w-full rounded-xl bg-[var(--color-divider)]" />
      <div className="motion-shimmer mt-6 h-48 w-full rounded-xl bg-[var(--color-divider)]" />
    </div>
  );
}

/** `/close-friends` loading */
export function CloseFriendsPageSkeleton() {
  return (
    <div className="ms-page-wrapper ms-container-standard min-w-0 pb-12 pt-6" aria-busy="true">
      <div className="motion-shimmer mb-2 h-4 w-32 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-3 h-7 w-52 max-w-full rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-5 h-9 w-full max-w-lg rounded-full bg-[var(--color-divider)]" />
      <SkeletonList count={5} />
    </div>
  );
}

/** `/saved` SSR Suspense fallback */
export function SavedPageSkeleton() {
  return (
    <div className="ms-page-wrapper ms-container-standard min-w-0 px-[var(--sp-3)] py-[var(--sp-4)]" aria-busy="true">
      <div className="motion-shimmer mb-4 h-8 w-44 rounded bg-[var(--color-divider)]" />
      <div className="motion-shimmer mb-3 h-4 w-56 rounded bg-[var(--color-divider)]" />
      <SkeletonList count={4} />
    </div>
  );
}

/** `/settings` loading */
export function SettingsPageSkeleton() {
  return (
    <div className="sg-shell ms-page-wrapper--no-top min-w-0" aria-busy="true">
      <div className="ms-container-wide pt-6">
        <div className="motion-shimmer mb-6 h-8 w-32 rounded bg-[var(--color-divider)]" />
        <div className="grid gap-6 min-[900px]:grid-cols-[220px_1fr]">
          <div className="motion-shimmer hidden h-64 rounded-lg bg-[var(--color-divider)] min-[900px]:block" />
          <div className="motion-shimmer h-80 rounded-lg bg-[var(--color-divider)]" />
        </div>
      </div>
    </div>
  );
}
