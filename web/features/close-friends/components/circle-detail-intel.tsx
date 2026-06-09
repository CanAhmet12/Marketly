import type { PrivateCircleIntel } from "@/features/close-friends/domain/types";
import { CloseFriendsSectionHeader } from "@/features/close-friends/components/close-friends-ui";

type Props = { intel: PrivateCircleIntel };

export function CircleDetailIntel({ intel }: Props) {
  const rows = (
    [
      ["Üyeler", intel.member_activity_label],
      ["Üretici", intel.creator_participation_label],
      ["Özel etkileşim", intel.private_engagement_label],
      ["Tartışma yoğunluğu", intel.discussion_density_label],
      ["Premium katılım", intel.premium_participation_label],
      ["Davet ivmesi", intel.invite_momentum_label],
      ["Güven ısısı", intel.trust_heat_label],
      ["Örtüşme", intel.member_overlap_label],
    ] as const
  ).filter(([, v]) => v.trim().length > 0 && v !== "—");

  if (rows.length === 0) return null;

  return (
    <section>
      <CloseFriendsSectionHeader title="Daire istihbaratı" />
      <dl className="cf-stat-grid">
        {rows.map(([label, value]) => (
          <div key={label} className="cf-stat">
            <dt className="cf-stat-label">{label}</dt>
            <dd className="cf-stat-value">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
