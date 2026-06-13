"use client";

import { HScroll, RailHeader } from "@/features/discover/visual-reference/discover-vr-primitives";
import { SignalCatalogCard } from "@/features/signals/components/signals-market-sections";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

type Props = {
  title?: string;
  kicker?: string;
  rows: SignalsFeedRow[];
  onOpen: (row: SignalsFeedRow) => void;
};

export function SignalDetailRelatedRail({
  title = "Benzer çağrılar",
  kicker = "Aynı varlık · aynı analist",
  rows,
  onOpen,
}: Props) {
  if (!rows.length) return null;

  return (
    <section className="sp-stream-band sp-stream-band--featured sp-related-rail" aria-label={title}>
      <RailHeader seriesKicker={kicker} label={title} accent="signal" className="sp-stream-rail-head" />
      <HScroll className="dvr-hscroll--sig-rail">
        {rows.map((row, i) => (
          <div key={row.id} className="dvr-sig-rail-item shrink-0">
            <SignalCatalogCard row={row} index={i} onOpen={() => onOpen(row)} />
          </div>
        ))}
      </HScroll>
    </section>
  );
}
