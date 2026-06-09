import type { MembershipDiscoveryCard, MembershipDiscoveryRails } from "@/features/subscriptions/domain/types";
import { SubscriptionsCreatorRow } from "@/features/subscriptions/components/subscriptions-creator-row";

type RailDef = {
  key: keyof MembershipDiscoveryRails;
  title: string;
  sub?: string;
};

const RAIL_DEFS: RailDef[] = [
  { key: "recommended_for_you", title: "Sana önerilen", sub: "İlgi grafiği ve portföyle hizalı" },
  { key: "rising_premium", title: "Yükselen premium" },
  { key: "institutional_style", title: "Kurumsal tempo", sub: "Derinlik ve risk çerçevesi" },
  { key: "strategy_focused", title: "Strateji & sinyal masası" },
  { key: "portfolio_aligned", title: "Portföyünle ilişkili" },
  { key: "premium_room_spotlight", title: "Premium oda keşfi" },
  { key: "macro_desk", title: "Makro masa" },
  { key: "high_conviction", title: "Yüksek isabet profili" },
];

type Props = {
  rails: MembershipDiscoveryRails;
  catalog: MembershipDiscoveryCard[];
  mode: "overview" | "discover" | "catalog";
};

export function SubscriptionsDiscoverySection({ rails, catalog, mode }: Props) {
  if (mode === "catalog") {
    if (catalog.length === 0) return null;
    return (
      <section>
        <div className="sub-section-head">
          <h2 className="sub-section-title">Tüm üretici üyelikleri</h2>
          <p className="sub-section-desc">Ücretli katman tanımlayan tüm üreticiler</p>
        </div>
        <div className="sub-catalog-grid">
          {catalog.map((c) => (
            <SubscriptionsCreatorRow key={c.creator_id} card={c} />
          ))}
        </div>
      </section>
    );
  }

  const visibleRails = RAIL_DEFS.map((def) => ({
    ...def,
    cards: rails[def.key],
  })).filter((r) => r.cards.length > 0);

  if (visibleRails.length === 0) {
    if (catalog.length === 0) return null;
    return (
      <section>
        <div className="sub-section-head">
          <h2 className="sub-section-title">Öne çıkan üreticiler</h2>
        </div>
        <div className="sub-rail-scroll">
          {catalog.slice(0, 8).map((c) => (
            <SubscriptionsCreatorRow key={c.creator_id} card={c} />
          ))}
        </div>
      </section>
    );
  }

  const railsToShow = mode === "overview" ? visibleRails.slice(0, 2) : visibleRails;

  return (
    <>
      {railsToShow.map((rail) => (
        <section key={rail.key} className="sub-rail-block">
          <div className="sub-section-head">
            <h2 className="sub-section-title">{rail.title}</h2>
            {rail.sub ? <p className="sub-section-desc">{rail.sub}</p> : null}
          </div>
          <div className="sub-rail-scroll">
            {rail.cards.map((c) => (
              <SubscriptionsCreatorRow key={c.creator_id} card={c} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
