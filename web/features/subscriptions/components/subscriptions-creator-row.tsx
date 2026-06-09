import Image from "next/image";
import Link from "next/link";

import type { MembershipDiscoveryCard } from "@/features/subscriptions/domain/types";
import { formatTierKey } from "@/features/subscriptions/lib/tier-labels";

type Props = {
  card: MembershipDiscoveryCard;
};

export function SubscriptionsCreatorRow({ card }: Props) {
  const intelRows = [
    { label: "Takipçi", value: card.intel.subscriber_momentum_label },
    { label: "İçerik", value: card.intel.premium_engagement_label },
    { label: "Son aktivite", value: card.intel.consistency_label },
  ].filter((r) => r.value.trim());

  const heatPct = `${Math.round(Math.min(1, Math.max(0, card.heat_score)) * 100)}%`;

  return (
    <Link href={card.href_detail} className="sub-creator-row">
      <div className="sub-creator-row-inner">
        <div className="sub-creator-avatar">
          {card.avatar_url ? (
            <Image src={card.avatar_url} alt={card.display_name} fill className="object-cover" sizes="44px" />
          ) : (
            <span className="sub-creator-avatar-fallback">{card.display_name.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div className="sub-creator-body">
          <div className="sub-creator-head">
            <span className="sub-creator-name">{card.display_name}</span>
            {card.verified ? <span className="sub-creator-verified">Doğrulanmış</span> : null}
          </div>
          <p className="sub-creator-handle">{card.handle}</p>
          <p className="sub-creator-thesis">{card.thesis_line}</p>
          <p className="sub-creator-rel">{card.rel_label}</p>
          {card.tier_keys.length > 0 ? (
            <div className="sub-tier-chips">
              {card.tier_keys.slice(0, 4).map((k) => (
                <span key={k} className="sub-tier-chip">
                  {formatTierKey(k)}
                </span>
              ))}
            </div>
          ) : null}
          <div className="sub-heat-bar" aria-hidden>
            <div className="sub-heat-bar-fill" style={{ width: heatPct }} />
          </div>
          {intelRows.length > 0 ? (
            <dl className="sub-creator-intel">
              {intelRows.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
