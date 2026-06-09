import type { MembershipTierDefinition } from "@/features/subscriptions/domain/types";
import { cn } from "@/lib/cn";

const ACCESS_ROWS: { k: keyof MembershipTierDefinition["access"]; label: string }[] = [
  { k: "rooms", label: "Odalar" },
  { k: "signals", label: "Sinyaller" },
  { k: "discussions", label: "Tartışmalar" },
  { k: "watchlists", label: "İzleme" },
  { k: "live", label: "Canlı" },
  { k: "research", label: "Araştırma" },
  { k: "archives", label: "Arşiv" },
  { k: "notes", label: "Notlar" },
];

type Props = {
  tiers: MembershipTierDefinition[];
};

export function MembershipTierTable({ tiers }: Props) {
  return (
    <div>
      {tiers.map((tier) => (
        <div
          key={tier.key}
          className={cn("sub-tier-block", tier.highlight && "sub-tier-block--highlight")}
        >
          <div className="sub-tier-head">
            <h3 className="sub-tier-name">{tier.label}</h3>
            {tier.monthly_hint ? <span className="sub-tier-price">{tier.monthly_hint}</span> : null}
          </div>
          <p className="sub-tier-pitch">{tier.pitch}</p>
          <div className="sub-access-grid">
            {ACCESS_ROWS.map((r) => (
              <div key={r.k}>
                <p className="sub-access-cell-label">{r.label}</p>
                <p className="sub-access-cell-value">{tier.access[r.k]}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
