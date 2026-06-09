import Image from "next/image";
import Link from "next/link";

import type { PrivateCircleSummary } from "@/features/close-friends/domain/types";
import { formatCircleKind } from "@/features/close-friends/lib/kind-labels";

type Props = { circle: PrivateCircleSummary };

export function CloseFriendsCircleRow({ circle }: Props) {
  const intelRows = [
    { label: "Güven", value: circle.intel.trust_heat_label },
    { label: "Üyeler", value: circle.intel.member_activity_label },
  ].filter((r) => r.value.trim() && r.value !== "—");

  return (
    <Link href={circle.href} className="cf-circle-row">
      <div className="cf-circle-row-inner">
        <div className="cf-circle-avatar">
          {circle.avatar_url ? (
            <Image src={circle.avatar_url} alt={circle.creator_display} fill className="object-cover" sizes="44px" />
          ) : (
            <span className="cf-circle-avatar-fallback">{circle.creator_display.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div className="cf-circle-body">
          <div className="cf-circle-head">
            <span className="cf-circle-name">{circle.title}</span>
            {circle.access.locked ? <span className="cf-circle-badge">Kilitli</span> : null}
          </div>
          <p className="cf-circle-handle">{circle.creator_handle}</p>
          <p className="cf-circle-thesis">{circle.subline}</p>
          <div className="cf-tier-chips">
            <span className="cf-tier-chip">{circle.access.label}</span>
            <span className="cf-tier-chip">{formatCircleKind(circle.kind)}</span>
          </div>
          {intelRows.length > 0 ? (
            <dl className="cf-circle-intel">
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
