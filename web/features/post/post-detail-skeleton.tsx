export function PostDetailSkeleton() {
  return (
    <div className="pd-skeleton" aria-hidden="true">
      <header className="pd-topbar">
        <div className="pd-shimmer pd-shimmer--back-pill" />
        <div className="pd-shimmer pd-shimmer--topbar-label" />
      </header>

      <div className="pd-page">
        <div className="pd-main-col">
          <div className="pd-prose pd-skeleton-prose">
            <div className="pd-skeleton-author">
              <div className="pd-shimmer pd-shimmer--avatar" />
              <div className="pd-skeleton-author-meta">
                <div className="pd-shimmer pd-shimmer--name" />
                <div className="pd-shimmer pd-shimmer--handle" />
              </div>
            </div>
            <div className="pd-shimmer pd-shimmer--title" />
            <div className="pd-shimmer pd-shimmer--body-line" />
            <div className="pd-shimmer pd-shimmer--body-line-short" />
          </div>

          <div className="pd-media-inset">
            <div className="pd-shimmer pd-shimmer--media" />
          </div>

          <hr className="pd-section-divider" />

          <div className="pd-prose pd-discussion-wrap">
            <div className="pd-shimmer pd-shimmer--section-label" />
            <div className="pd-shimmer pd-shimmer--composer" />
          </div>
        </div>

        <aside className="pd-sidebar-col">
          <div className="pd-side-block">
            <div className="pd-shimmer pd-shimmer--side-label" />
            <div className="pd-skeleton-author">
              <div className="pd-shimmer pd-shimmer--avatar" />
              <div className="pd-skeleton-author-meta">
                <div className="pd-shimmer pd-shimmer--side-name" />
                <div className="pd-shimmer pd-shimmer--side-handle" />
              </div>
            </div>
          </div>
          <div className="pd-side-block">
            <div className="pd-shimmer pd-shimmer--side-cta" />
          </div>
        </aside>
      </div>
    </div>
  );
}
