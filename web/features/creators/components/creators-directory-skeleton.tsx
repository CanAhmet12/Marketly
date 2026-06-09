/** Creators v2 — filter + rail + tape skeleton */

type Props = {
  inline?: boolean;
};

function FilterSkeleton() {
  return <div className="crt-v2-sk-filter" aria-hidden />;
}

function RailSkeleton() {
  return (
    <div className="crt-v2-sk-rail-row" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="crt-v2-sk-card" />
      ))}
    </div>
  );
}

function TapeSkeleton() {
  return (
    <div aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="crt-v2-sk-tape" />
      ))}
    </div>
  );
}

export function CreatorsDirectorySkeleton({ inline = false }: Props) {
  const body = (
    <>
      <FilterSkeleton />
      <RailSkeleton />
      <RailSkeleton />
      <TapeSkeleton />
    </>
  );

  if (inline) return body;

  return (
    <div className="crt-v2-page ms-page-wrapper ms-page-wrapper--compact" aria-busy="true">
      <div className="ms-container-wide">
        <div className="crt-v2-layout">{body}</div>
      </div>
    </div>
  );
}
