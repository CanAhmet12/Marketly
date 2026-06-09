export function PostDiscussionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="pd-comment-skeleton" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pd-comment-skeleton__row">
          <div className="pd-shimmer pd-shimmer--comment-avatar" />
          <div className="pd-comment-skeleton__body">
            <div className="pd-shimmer pd-shimmer--comment-name" />
            <div className="pd-shimmer pd-shimmer--comment-line" />
            <div className="pd-shimmer pd-shimmer--comment-line-short" />
          </div>
        </div>
      ))}
    </div>
  );
}
