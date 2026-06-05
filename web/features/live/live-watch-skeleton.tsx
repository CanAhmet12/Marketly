/** Canlı oynatıcı SSR Suspense fallback. */

export function LiveWatchSkeleton() {
  return (
    <div className="live-watch live-watch--loading" aria-busy="true">
      <div className="live-watch__cinema live-watch__cinema--skeleton">
        <div className="live-watch__primary">
          <div className="live-watch__stage live-watch__stage--skeleton" />
          <div className="live-watch__dock live-watch__dock--skeleton" />
        </div>
      </div>
    </div>
  );
}
