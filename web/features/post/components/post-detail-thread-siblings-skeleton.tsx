export function PostDetailThreadSiblingsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="pd-thread-siblings pd-thread-siblings--skeleton" aria-hidden>
      <div className="pd-shimmer pd-shimmer--side-label" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pd-thread-siblings__skel-row">
          <div className="pd-shimmer pd-shimmer--comment-line" />
          <div className="pd-shimmer pd-shimmer--side-cta" />
        </div>
      ))}
    </div>
  );
}
