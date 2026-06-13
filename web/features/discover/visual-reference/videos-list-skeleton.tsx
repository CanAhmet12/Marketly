/** `/videos` liste sayfası skeleton — peak rail + prestige + grid silueti. */

type Props = {
  inline?: boolean;
};

export function VideosListSkeleton({ inline = false }: Props) {
  const grid = (
    <div className="dvr-vertical-stream dvr-vertical-stream--videos" aria-hidden>
      <div className="dvr-skeleton-rail dvr-skeleton-rail--peak">
        <div className="dvr-skeleton-rail-head">
          <div className="dvr-skeleton-line dvr-skeleton-line--accent" aria-hidden />
          <div className="dvr-skeleton-line dvr-skeleton-line--label" style={{ width: "8rem" }} />
        </div>
        <div className="dvr-skeleton-hscroll">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="dvr-skeleton-block dvr-skeleton-block--video-tile" />
          ))}
        </div>
      </div>
      <div className="dvr-skeleton-rail">
        <div className="dvr-skeleton-rail-head">
          <div className="dvr-skeleton-line dvr-skeleton-line--accent" aria-hidden />
          <div className="dvr-skeleton-line dvr-skeleton-line--label" style={{ width: "9.5rem" }} />
        </div>
        <div className="dvr-skeleton-hscroll">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="dvr-skeleton-block dvr-skeleton-block--video-tile" />
          ))}
        </div>
      </div>
      <div className="dvr-vertical-grid-section dvr-vertical-grid-section--videos">
        <div className="dvr-skeleton-line" style={{ width: "4.5rem", height: "0.55rem" }} />
        <div className="dvr-skeleton-line" style={{ width: "7rem", height: "0.72rem", marginTop: "0.28rem" }} />
        <div className="dvr-video-full-grid" style={{ marginTop: "0.78rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="dvr-skeleton-block dvr-skeleton-block--video-tile" />
          ))}
        </div>
      </div>
    </div>
  );

  if (inline) return grid;

  return (
    <div className="dvr-surface dvr-surface--vertical-page dvr-surface--videos-page" aria-busy="true">
      <header className="dvr-top-chrome">
        <div className="dvr-skeleton-line dvr-skeleton-line--ticker" />
        <div className="dvr-vertical-page-head">
          <div className="dvr-skeleton-line" style={{ width: "5rem", height: "0.85rem" }} />
          <div className="dvr-skeleton-line" style={{ width: "7rem", height: "1.5rem", marginTop: "0.65rem" }} />
          <div className="dvr-skeleton-line" style={{ width: "22rem", height: "0.65rem", marginTop: "0.45rem", maxWidth: "100%" }} />
        </div>
      </header>
      <div className="dvr-content dvr-content--vertical-page">{grid}</div>
    </div>
  );
}
