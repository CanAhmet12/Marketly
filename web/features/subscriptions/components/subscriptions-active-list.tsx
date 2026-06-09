import type { ActiveMembershipRow } from "@/features/subscriptions/domain/types";
import Link from "next/link";

type Props = {
  rows: ActiveMembershipRow[];
};

export function SubscriptionsActiveList({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="sub-empty-hint">
        Henüz aktif üyeliğin yok. Keşfet sekmesinden bir üreticinin planına girerek kilitleri inceleyebilirsin.
      </p>
    );
  }

  return (
    <ul className="sub-active-list">
      {rows.map((m) => (
        <li key={m.creator_id} className="sub-active-row">
          <div className="min-w-0">
            <p className="sub-active-name">{m.display_name}</p>
            <p className="sub-active-meta">
              {m.handle} · {m.tier_label}
              {m.renew_hint ? ` · ${m.renew_hint}` : null}
            </p>
          </div>
          <div className="sub-active-actions">
            <Link href={m.href_detail} className="sub-active-link">
              Plan
            </Link>
            <Link href={m.href_channel} className="sub-active-link sub-active-link--muted">
              Kanal
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
