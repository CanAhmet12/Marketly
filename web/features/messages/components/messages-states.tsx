"use client";

import { SkeletonList } from "@/components/states";

export function MessagesPageSkeleton() {
  return (
    <div className="msg-studio" aria-busy="true">
      <div className="msg-page">
        <div className="msg-intel-block">
          <div className="motion-shimmer h-4 w-48 rounded bg-[var(--color-divider)]" />
          <div className="msg-intel-grid" style={{ marginTop: 12 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="motion-shimmer h-12 rounded bg-[var(--color-divider)]" />
            ))}
          </div>
        </div>
        <div className="motion-shimmer mb-3 h-10 w-full rounded bg-[var(--color-divider)]" />
        <div className="msg-surface msg-shell min-w-0">
          <aside className="msg-sidebar hidden min-[800px]:flex">
            <div className="msg-sidebar-head">
              <div className="motion-shimmer h-9 w-full rounded-lg bg-[var(--color-divider)]" />
            </div>
            <div className="p-3">
              <SkeletonList count={5} />
            </div>
          </aside>
          <section className="msg-thread hidden min-[800px]:flex">
            <div className="motion-shimmer m-auto h-24 w-48 rounded-xl bg-[var(--color-divider)]" />
          </section>
        </div>
      </div>
    </div>
  );
}
