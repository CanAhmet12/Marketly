/** Keşfet hub skeleton — SSR Suspense + client loading ile aynı DVR silueti. */

import { cn } from "@/lib/cn";

type SkeletonPreset = "hub" | "live" | "pulse" | "videos" | "signals" | "creators";

type Props = {

  /** Yalnızca içerik alanı (client yükleme) */

  inline?: boolean;

  /** Sekme önizlemesi için kısaltılmış siluet */

  preset?: SkeletonPreset;

};



type RailVariant = "live-peak" | "pulse" | "video" | "live-compact" | "topic" | "signal-rail" | "creator";



function RailSkeleton({ variant = "pulse" }: { variant?: RailVariant }) {

  const labelWidths: Record<RailVariant, string> = {

    "live-peak": "8.5rem",

    pulse: "9.25rem",

    video: "8rem",

    "live-compact": "7.5rem",

    topic: "10rem",

    "signal-rail": "8.75rem",

    creator: "8.75rem",

  };



  if (variant === "topic") {

    return (

      <div className="dvr-skeleton-rail dvr-skeleton-rail--topic">

        <div className="dvr-skeleton-line dvr-skeleton-line--label" style={{ width: labelWidths.topic }} />

        <div className="dvr-skeleton-topic-shell">

          <div className="dvr-skeleton-line" style={{ width: "62%", height: "0.72rem" }} />

          <div className="dvr-skeleton-line" style={{ width: "78%", height: "0.55rem", marginTop: "0.32rem" }} />

          <div className="dvr-skeleton-topic-grid">

            {Array.from({ length: 6 }).map((_, i) => (

              <div key={i} className="dvr-skeleton-block dvr-skeleton-block--topic-tile" />

            ))}

          </div>

        </div>

      </div>

    );

  }



  const blockClass =
    variant === "live-peak"
      ? "dvr-skeleton-block dvr-skeleton-block--live-hero"
      : variant === "signal-rail"
          ? "dvr-skeleton-block dvr-skeleton-block--signal-rail-card"
          : variant === "video"
            ? "dvr-skeleton-block dvr-skeleton-block--video-tile"
          : variant === "live-compact"
            ? "dvr-skeleton-block dvr-skeleton-block--live-compact"
            : variant === "creator"
              ? "dvr-skeleton-block dvr-skeleton-block--creator-tile"
              : "dvr-skeleton-block dvr-skeleton-block--pulse-tile";



  const count =

    variant === "live-peak"
      ? 2
      : variant === "signal-rail"
        ? 4
        : variant === "live-compact" || variant === "creator"
          ? 3
          : 4;



  return (

    <div className={cn("dvr-skeleton-rail", variant === "live-peak" && "dvr-skeleton-rail--peak")}>

      <div className="dvr-skeleton-rail-head">

        <div className="dvr-skeleton-line dvr-skeleton-line--accent" aria-hidden />

        <div className="dvr-skeleton-line dvr-skeleton-line--label" style={{ width: labelWidths[variant] }} />

      </div>

      <div className="dvr-skeleton-hscroll">

        {Array.from({ length: count }).map((_, i) => (

          <div key={i} className={blockClass} />

        ))}

      </div>

    </div>

  );

}



function ChromeSkeleton() {

  return (

    <>

      <div className="dvr-skeleton-line dvr-skeleton-line--ticker" />

      <div className="dvr-sticky-bar">

        <div className="dvr-sticky-bar__inner">

          <div className="dvr-tab-bar-wrap" aria-hidden>

            <div className="dvr-tab-bar">

              {["Tümü", "Canlı Yayınlar", "Pulse", "Videolar", "Sinyaller", "Üreticiler"].map((l) => (

                <div key={l} className="dvr-tab dvr-skeleton-tab">

                  <span className="dvr-tab__label">{l}</span>

                </div>

              ))}

            </div>

          </div>

        </div>

        <div className="dvr-chrome-discovery" aria-hidden>

          <div className="dvr-skeleton-chrome-section">

            <div className="dvr-skeleton-chrome-head">

              <div className="dvr-skeleton-chrome-head__main">

                <div className="dvr-skeleton-line dvr-skeleton-line--sm" style={{ width: "7.5rem" }} />

                <div className="dvr-skeleton-line dvr-skeleton-line--xs" style={{ width: "11rem" }} />

              </div>

              <div className="dvr-skeleton-line dvr-skeleton-line--xs" style={{ width: "4.25rem" }} />

            </div>

            <div className="dvr-skeleton-hscroll dvr-skeleton-hscroll--chips">

              {Array.from({ length: 6 }).map((_, i) => (

                <div key={i} className="dvr-skeleton-block dvr-skeleton-block--chip" />

              ))}

            </div>

          </div>

          <div className="dvr-skeleton-chrome-section">

            <div className="dvr-skeleton-chrome-head">

              <div className="dvr-skeleton-chrome-head__main">

                <div className="dvr-skeleton-line dvr-skeleton-line--sm" style={{ width: "8.5rem" }} />

                <div className="dvr-skeleton-line dvr-skeleton-line--xs" style={{ width: "12rem" }} />

              </div>

              <div className="dvr-skeleton-line dvr-skeleton-line--xs" style={{ width: "4.25rem" }} />

            </div>

            <div className="dvr-skeleton-hscroll dvr-skeleton-hscroll--faces">

              {Array.from({ length: 5 }).map((_, i) => (

                <div key={i} className="dvr-skeleton-block dvr-skeleton-block--face" />

              ))}

            </div>

          </div>

        </div>

      </div>

    </>

  );

}



function CreatorDirectorySkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="dvr-skeleton-creator-directory">
      <div className="dvr-skeleton-rail-head">
        <div className="dvr-skeleton-line dvr-skeleton-line--accent" aria-hidden />
        <div className="dvr-skeleton-line dvr-skeleton-line--label" style={{ width: "7.5rem" }} />
      </div>
      <div className="dvr-skeleton-creator-directory-list">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="dvr-skeleton-creator-directory-row" />
        ))}
      </div>
    </div>
  );
}

function SignalTabSkeleton() {
  return (
    <>
      <div className="dvr-skeleton-sig-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dvr-skeleton-sig-stat" />
        ))}
      </div>
      <div className="dvr-skeleton-sig-hero" />
      <div className="dvr-skeleton-sig-intel-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dvr-skeleton-sig-intel-card" />
        ))}
      </div>
      <SignalTapeSkeleton rows={5} />
    </>
  );
}

function SignalTapeSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="dvr-skeleton-signal-section">
      <div className="dvr-skeleton-rail-head">
        <div className="dvr-skeleton-line dvr-skeleton-line--accent" aria-hidden />
        <div className="dvr-skeleton-line dvr-skeleton-line--label" style={{ width: "8rem" }} />
      </div>
      <div className="dvr-skeleton-signal-tape">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="dvr-skeleton-signal-row" />
        ))}
      </div>
    </div>
  );
}

function skeletonRailsForPreset(preset: SkeletonPreset) {
  switch (preset) {
    case "live":
      return (
        <>
          <div className="dvr-skeleton-tab-intro" />
          <RailSkeleton variant="live-peak" />
          <RailSkeleton variant="live-compact" />
        </>
      );
    case "pulse":
      return (
        <>
          <div className="dvr-skeleton-tab-intro dvr-skeleton-tab-intro--pulse" />
          <RailSkeleton variant="pulse" />
          <RailSkeleton variant="pulse" />
          <RailSkeleton variant="pulse" />
        </>
      );
    case "videos":
      return (
        <>
          <div className="dvr-skeleton-tab-intro dvr-skeleton-tab-intro--videos" />
          <RailSkeleton variant="video" />
        </>
      );
    case "signals":
      return (
        <>
          <div className="dvr-skeleton-tab-intro dvr-skeleton-tab-intro--signals" />
          <SignalTabSkeleton />
        </>
      );
    case "creators":
      return (
        <>
          <div className="dvr-skeleton-tab-intro dvr-skeleton-tab-intro--creators" />
          <div className="dvr-skeleton-chrome-section">
            <div className="dvr-skeleton-hscroll dvr-skeleton-hscroll--faces">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="dvr-skeleton-block dvr-skeleton-block--face" />
              ))}
            </div>
          </div>
          <CreatorDirectorySkeleton rows={3} />
          <CreatorDirectorySkeleton rows={6} />
        </>
      );
    default:
      return (
        <>
          <RailSkeleton variant="live-peak" />
          <RailSkeleton variant="pulse" />
          <RailSkeleton variant="video" />
          <RailSkeleton variant="topic" />
          <RailSkeleton variant="live-compact" />
          <RailSkeleton variant="pulse" />
          <RailSkeleton variant="signal-rail" />
        </>
      );
  }
}

export function DiscoverFeedSkeleton({ inline = false, preset = "hub" }: Props) {

  const body = (

    <div className="dvr-stream dvr-skeleton-stream" aria-hidden>

      {skeletonRailsForPreset(preset)}

      {preset === "hub" ? (
        <div className="dvr-skeleton-footer">
          <div className="dvr-skeleton-line dvr-skeleton-line--footer" />
        </div>
      ) : null}

    </div>

  );



  if (inline) {

    return <div className="dvr-content dvr-content--skeleton">{body}</div>;

  }



  return (

    <div className="dvr-surface dvr-surface--skeleton" aria-busy="true" aria-label="Keşfet yükleniyor">

      <header className="dvr-top-chrome">

        <ChromeSkeleton />

      </header>

      <div className="dvr-content dvr-content--skeleton">{body}</div>

    </div>

  );

}


