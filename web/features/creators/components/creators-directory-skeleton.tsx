/** Creators canvas — headless skeleton */

type Props = {
  inline?: boolean;
};

function IntelZoneSkeleton() {
  return (
    <div className="crt-canvas__intel-zone" aria-hidden>
      <div className="crt-canvas__sk-intel-head">
        <div>
          <div className="crt-canvas__sk-intel-kicker" />
          <div className="crt-canvas__sk-intel-title" />
        </div>
        <div className="crt-canvas__sk-intel-pill" />
      </div>
      <div className="crt-canvas__sk-deck">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="crt-canvas__sk-tile" />
        ))}
      </div>
    </div>
  );
}

function SpotlightSkeleton() {
  return (
    <div className="crt-canvas__spotlight-zone" aria-hidden>
      <div className="crt-canvas__sk-spotlight-head">
        <div>
          <div className="crt-canvas__sk-spotlight-kicker" />
          <div className="crt-canvas__sk-spotlight-title" />
        </div>
        <div className="crt-canvas__sk-spotlight-badge" />
      </div>
      <div className="crt-canvas__sk-hero crt-canvas__hero-bento" />
    </div>
  );
}

function DiscoveryRailsSkeleton() {
  return (
    <div className="crt-canvas__discovery-zone" aria-hidden>
      <div className="crt-canvas__sk-discovery-head">
        <div>
          <div className="crt-canvas__sk-discovery-kicker" />
          <div className="crt-canvas__sk-discovery-title" />
        </div>
        <div className="crt-canvas__sk-discovery-badge" />
      </div>
      <div className="crt-canvas__sk-discovery-rails">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="crt-canvas__sk-discovery-rail">
            <div className="crt-canvas__sk-discovery-rail-head" />
            <div className="crt-canvas__sk-discovery-rail-line" />
            <div className="crt-canvas__sk-discovery-cards">
              {Array.from({ length: 3 }).map((__, j) => (
                <div key={j} className="crt-canvas__sk-discovery-card" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenerSkeleton() {
  return (
    <div className="crt-canvas__screener-zone crt-canvas__sk-screener-zone" aria-hidden>
      <div className="crt-canvas__sk-screener-head">
        <div>
          <div className="crt-canvas__sk-screener-kicker" />
          <div className="crt-canvas__sk-screener-title" />
        </div>
        <div className="crt-canvas__sk-screener-badge" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="crt-canvas__sk-screener-row" />
      ))}
    </div>
  );
}

export function CreatorsDirectorySkeleton({ inline = false }: Props) {
  const body = (
    <>
      <IntelZoneSkeleton />
      <SpotlightSkeleton />
      <DiscoveryRailsSkeleton />
      <ScreenerSkeleton />
    </>
  );

  if (inline) return body;

  return (
    <div aria-busy="true">
      {body}
    </div>
  );
}
