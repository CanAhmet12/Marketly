"use client";

import Link from "next/link";

type Props = {
  postCount: number;
};

export function HomeFeedDiscoverNudge({ postCount }: Props) {
  if (postCount < 3) return null;

  return (
    <aside className="hv-ref-feed-nudge" aria-label="Keşfet önerisi">
      <p className="hv-ref-feed-nudge__title">Daha fazla içerik keşfet</p>
      <p className="hv-ref-feed-nudge__desc">
        Sinyaller, videolar ve creator&apos;lar — piyasa odaklı içerik havuzuna göz at.
      </p>
      <div className="hv-ref-feed-nudge__actions">
        <Link href="/discover" className="hv-ref-feed-nudge__btn hv-ref-feed-nudge__btn--primary">
          Keşfet
        </Link>
        <Link href="/signals" className="hv-ref-feed-nudge__btn">
          Sinyaller
        </Link>
        <Link href="/creators" className="hv-ref-feed-nudge__btn">
          Creator&apos;lar
        </Link>
      </div>
    </aside>
  );
}
