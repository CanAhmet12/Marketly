import type { PrivateCircleKind, PrivateCircleSummary } from "@/features/close-friends/domain/types";
import { formatCircleKind } from "@/features/close-friends/lib/kind-labels";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean | null;
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildCircleSummary(
  profile: ProfileRow,
  kind: PrivateCircleKind = "close_followers",
): PrivateCircleSummary {
  const h = hash(`${profile.id}::${kind}`);
  const name = profile.full_name?.trim() || profile.username?.trim() || "Üretici";
  const handle = profile.username ? `@${profile.username}` : "@user";
  const kindLabel = formatCircleKind(kind);
  const locked = kind === "inner_strategy" || kind === "creator_selected";

  return {
    id: `${profile.id}::${kind}`,
    creator_id: profile.id,
    creator_display: name,
    creator_handle: handle,
    avatar_url: profile.avatar_url,
    verified: Boolean(profile.verified),
    kind,
    title: `${name.split(" ")[0] ?? name} · ${kindLabel}`,
    subline: `${kindLabel} — özel kitle güncellemeleri`,
    access: {
      mode: locked ? "invite_only" : "creator_selected",
      label: locked ? "Davet + rol" : "Yakın çevre",
      locked,
      role_hint: locked ? "Güvenilir üye" : null,
      temporary_hint: null,
    },
    intel: {
      member_activity_label: h % 2 === 0 ? "Üye aktivitesi dengeli" : "Üye aktivitesi seçici",
      creator_participation_label: profile.verified ? "Doğrulanmış üretici" : "Üretici katılımı aktif",
      private_engagement_label: "Özel etkileşim katmanı",
      discussion_density_label: "Tartışma derinliği korunuyor",
      premium_participation_label: "—",
      invite_momentum_label: "—",
      trust_heat_label: h % 3 === 0 ? "Güven ısısı sıcak" : "Güven ısısı ılık",
      member_overlap_label: "Dar daire",
    },
    href: `/hub/close-friends/circle/${encodeURIComponent(`${profile.id}::${kind}`)}`,
    subscription_href: `/hub/subscriptions/${encodeURIComponent(profile.id)}`,
    signals_href: `/channel/${encodeURIComponent(profile.id)}?tab=signals`,
    rooms_href: `/channel/${encodeURIComponent(profile.id)}?tab=rooms`,
    messages_href: "/hub/messages",
  };
}

export function circlesFromFriends(profiles: ProfileRow[]): PrivateCircleSummary[] {
  return profiles.map((p) => buildCircleSummary(p, "close_followers"));
}
