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

/** `/subscriptions` loading — re-export subscriptions v2 skeleton */
export { SubscriptionsPageSkeleton, MembershipDetailSkeleton } from "@/features/subscriptions/components/subscriptions-states";

/** `/close-friends` loading — re-export close-friends v2 skeleton */
export {
  CloseFriendsPageSkeleton,
  CircleDetailSkeleton,
} from "@/features/close-friends/components/close-friends-states";

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

/** `/settings` loading — re-export from settings v2 */
export { SettingsPageSkeleton } from "@/features/settings/components/settings-states";
