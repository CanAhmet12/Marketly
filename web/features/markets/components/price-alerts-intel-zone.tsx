import Link from "next/link";

import type { PriceAlertsIntel } from "@/features/markets/lib/build-price-alerts-intel";

type Props = { intel: PriceAlertsIntel };

export function PriceAlertsIntelZone({ intel }: Props) {
  if (intel.symbolChips.length === 0) return null;

  return (
    <section className="pa-intel-zone" aria-label="Alarm özeti">
      <div className="pa-intel-zone__header">
        <span className="pa-intel-zone__eyebrow">İzlenen semboller</span>
        <p className="pa-intel-zone__headline">{intel.headline}</p>
      </div>
      <div className="pa-intel-zone__chips">
        {intel.symbolChips.map((chip) => (
          <Link key={chip.symbol} href={chip.href} className="pa-intel-chip">
            <span className="pa-intel-chip__sym">{chip.symbol}</span>
            <span className="pa-intel-chip__count">{chip.count} alarm</span>
          </Link>
        ))}
      </div>
      <div className="pa-intel-zone__links">
        <Link href="/hub/watchlist" className="pa-intel-zone__link">
          Takip listem →
        </Link>
        <Link href="/hub/portfolio" className="pa-intel-zone__link">
          Portföy →
        </Link>
      </div>
    </section>
  );
}
