export function PostDetailSideSkeleton() {
  return (
    <div className="pd-side-skeleton" aria-hidden>
      <div className="pd-side-module pd-side-module--ghost">
        <div className="pd-shimmer pd-shimmer--side-label" />
        <div className="pd-shimmer pd-shimmer--side-name" />
        <div className="pd-shimmer pd-shimmer--side-handle" />
      </div>
      <div className="pd-side-module pd-side-module--ghost">
        <div className="pd-shimmer pd-shimmer--side-label" />
        <div className="pd-shimmer pd-shimmer--comment-line" />
        <div className="pd-shimmer pd-shimmer--comment-line-short" />
      </div>
    </div>
  );
}
