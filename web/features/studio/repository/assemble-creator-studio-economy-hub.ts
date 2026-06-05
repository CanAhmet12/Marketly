import type { MembershipDetailPayload } from "@/features/subscriptions/domain/types";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { getSignalsRepository } from "@/features/signals/repository";
import { getSocialRepository } from "@/features/social/repository";
import { getSubscriptionRepository } from "@/features/subscriptions/repository";
import { isMockDataEnabled } from "@/mock/config";

import type {
  CreatorStudioEconomyHubPayload,
  StudioEconomyAudienceIntel,
  StudioEconomyMemberRow,
  StudioEconomyMemberSegment,
  StudioEconomyPublishingDefaults,
  StudioEconomyRevenueIntel,
  StudioEconomyRoomControl,
  StudioEconomySignalControl,
  StudioEconomyTierRow,
} from "./types";

const NAV_CROSS = [
  { href: "/subscriptions", label: "Abonelikler" },
  { href: "/close-friends", label: "Özel daireler" },
  { href: "/signals", label: "Sinyaller" },
  { href: "/live", label: "Odalar" },
  { href: "/discover", label: "Keşfet" },
  { href: "/notifications", label: "Bildirimler" },
  { href: "/messages", label: "Mesajlar" },
] as const;

function accessModeFromLabel(label: string): StudioEconomySignalControl["access_mode"] {
  const t = label.toLowerCase();
  if (/abone|üye|üyelik|subscriber|member/.test(t)) return "subscriber";
  if (/öniz|preview|kısmi/.test(t)) return "preview";
  if (/kilit|lock|tam erişim yok|kapalı/.test(t)) return "locked";
  return "public";
}

function hashSeg(id: string): StudioEconomyMemberSegment {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const r = Math.abs(h) % 6;
  const pool: StudioEconomyMemberSegment[] = ["subscriber", "trusted", "premium", "room_leader", "high_engagement", "overlap"];
  return pool[r]!;
}

function sparsePayload(ownerId: string, mock: boolean): CreatorStudioEconomyHubPayload {
  const p = getPersonalizationRepository();
  const adapt = p.getRecommendationAdaptationSnapshot(ownerId);
  const line = adapt.subline || "Öneri motoru nötr — ekonomi verisi bağlanınca dolar.";
  return {
    headline: "Creator ekonomisi",
    subline: mock ? "Üyelik vitrininiz henüz oluşmadı veya profil eşleşmesi yok." : "Canlı üretici ekonomisi RPC ile doldurulacak.",
    data_sparse: true,
    creator_id: ownerId,
    nav_cross: [...NAV_CROSS],
    tiers: [],
    signal_controls: [],
    room_controls: [],
    audience: {
      subscriber_momentum: "—",
      room_engagement: "—",
      premium_participation: "—",
      discussion_quality: "—",
      signal_interaction: "—",
      loyalty: "—",
      strategy_fit: line,
      churn_hint: "Veri seyrek — erken uyarı pasif.",
      heat: "Ilık",
    },
    revenue: {
      revenue_band_placeholder: "Tahmini bant: veri bekleniyor",
      premium_growth_hint: "—",
      membership_distribution: "—",
      engagement_quality: "—",
      conversion_hint: adapt.hints[0] ?? "Keşif akışıyla hizalanan ilk dönüşüm ipuçları yüklenecek.",
    },
    publishing_defaults: {
      premium_default: "Varsayılan: herkese açık önizleme",
      room_target: "Oda hedefi: tanımlanmadı",
      circle_target: "Daire hedefi: tanımlanmadı",
      signal_visibility: "Sinyal görünürlüğü: standart",
      discussion_visibility: "Tartışma: takipçi + üye",
      recommendation_visibility: "Öneri görünürlüğü: platform varsayılanı",
      archive_behavior: "Arşiv: kademeli",
      preview_generation: "Önizleme: otomatik kısa özet",
    },
    members: [],
  };
}

function publishingFromTiers(detail: MembershipDetailPayload): StudioEconomyPublishingDefaults {
  const prem = detail.tiers.find((t) => t.key === "premium") ?? detail.tiers[0];
  const a = prem?.access;
  if (!a) {
    return {
      premium_default: "Katmanlar yüklenemedi",
      room_target: "—",
      circle_target: "—",
      signal_visibility: "—",
      discussion_visibility: "—",
      recommendation_visibility: "—",
      archive_behavior: "—",
      preview_generation: "—",
    };
  }
  return {
    premium_default: a.signals === "full" ? "Premium: tam sinyal masası" : "Premium: önizleme ağırlıklı",
    room_target: a.rooms === "full" ? "Oda: tüm premium odalar" : a.rooms === "preview" ? "Oda: seçili premium önizleme" : "Oda: topluluk + davet",
    circle_target: "Daire: üyelik ve davetli segmentlerle hizalı",
    signal_visibility: a.signals === "full" ? "Sinyal: abone + masa" : "Sinyal: önizleme + kilitli çağrılar",
    discussion_visibility: a.discussions === "full" ? "Tartışma: öncelikli sıra" : "Tartışma: seçili kanallar",
    recommendation_visibility: "Öneri: üretici vitrin + strateji etiketleri",
    archive_behavior: a.archives === "full" ? "Arşiv: tam segment" : "Arşiv: kademeli açılım",
    preview_generation: "Önizleme: sinyal özeti + risk bandı",
  };
}

export function assembleCreatorStudioEconomyHub(ownerId: string): CreatorStudioEconomyHubPayload {
  const mock = isMockDataEnabled();
  const sub = getSubscriptionRepository();
  const detail = sub.getMembershipDetail(ownerId, ownerId);

  if (!detail) {
    return sparsePayload(ownerId, mock);
  }

  const social = getSocialRepository();
  const roomsSurface = social.getCreatorCommunityRoomsSurface(ownerId);
  const sigFeed = getSignalsRepository().getFeedRows().filter((r) => r.analyst.id === ownerId);

  const tiers: StudioEconomyTierRow[] = detail.tiers.map((t) => ({
    key: t.key,
    label: t.label,
    visibility_label: t.highlight ? "Öne çıkan vitrin" : "Standart vitrin",
    price_placeholder: t.monthly_hint,
    included_line: t.pitch,
    href_manage: `/subscriptions/${encodeURIComponent(detail.creator_id)}`,
  }));

  const signal_controls: StudioEconomySignalControl[] = detail.signal_previews.map((s, i) => ({
    id: s.id,
    symbol: s.symbol,
    access_mode: accessModeFromLabel(s.access_label),
    bundle_label: i % 2 === 0 ? "Strateji paketi" : null,
    audience_hint: (() => {
      const sn = (s.thesis_snippet ?? "").trim();
      return sn.length > 72 ? `${sn.slice(0, 70)}…` : sn || null;
    })(),
    href: s.href,
  }));

  const roomMap = new Map<string, StudioEconomyRoomControl>();
  for (const r of roomsSurface.rooms) {
    roomMap.set(r.id, {
      id: r.id,
      label: r.label,
      premium: r.is_premium,
      circle_linked: /daire|circle|yakın|private/i.test(r.label + r.kind),
      moderation_label: roomsSurface.intelligence.premium_participation_label,
      invite_flow: r.is_premium ? "Davet + üyelik doğrulaması" : "Topluluk + moderasyon kuyruğu",
      featured: r.heat_label.includes("yüksek") || r.heat_label.includes("sıcak"),
      href: r.href,
    });
  }
  for (const rp of detail.room_previews) {
    if (!roomMap.has(rp.id)) {
      roomMap.set(rp.id, {
        id: rp.id,
        label: rp.label,
        premium: rp.premium,
        circle_linked: false,
        moderation_label: "Standart masa",
        invite_flow: rp.premium ? "Premium davet" : "Açık katılım",
        featured: rp.premium,
        href: rp.href,
      });
    }
  }
  const room_controls = [...roomMap.values()].slice(0, 8);

  const intel = detail.intel;
  const audience: StudioEconomyAudienceIntel = {
    subscriber_momentum: intel.subscriber_momentum_label,
    room_engagement: intel.room_participation_label,
    premium_participation: intel.premium_activity_heat_label,
    discussion_quality: intel.premium_engagement_label,
    signal_interaction: intel.premium_hit_rate_label,
    loyalty: intel.consistency_label,
    strategy_fit: intel.strategy_quality_label,
    churn_hint: "Erken uyarı: üye yenileme oranı izleniyor (taslak).",
    heat: intel.premium_activity_heat_label,
  };

  const revenue: StudioEconomyRevenueIntel = {
    revenue_band_placeholder: "Gelir bantı: Super Thanks + üyelik (taslak, RPC yok)",
    premium_growth_hint: intel.premium_activity_heat_label,
    membership_distribution: `${detail.tiers.length} aktif katman · odalar ${room_controls.filter((x) => x.premium).length}/${room_controls.length}`,
    engagement_quality: intel.premium_engagement_label,
    conversion_hint: `Sinyal vitrin: ${sigFeed.length} açık çağrı · tartışma ${detail.discussion_previews.length} ray`,
  };

  const publishing_defaults = publishingFromTiers(detail);

  const members: StudioEconomyMemberRow[] = [];
  let mi = 0;
  for (const t of detail.activity_timeline.slice(0, 5)) {
    members.push({
      id: `mem-act-${mi++}`,
      name: t.title,
      segment: hashSeg(t.id),
      quality_label: t.sub,
      invite_status: null,
      href: t.href ?? detail.links.discover,
    });
  }
  for (const d of detail.discussion_previews.slice(0, 3)) {
    members.push({
      id: `mem-dis-${mi++}`,
      name: d.label,
      segment: "premium",
      quality_label: d.sub,
      invite_status: "Katılım açık",
      href: d.href,
    });
  }

  return {
    headline: "Creator ekonomisi",
    subline: `${detail.display_name} · ${detail.strategy_summary.slice(0, 96)}${detail.strategy_summary.length > 96 ? "…" : ""}`,
    data_sparse: false,
    creator_id: detail.creator_id,
    nav_cross: [...NAV_CROSS],
    tiers,
    signal_controls,
    room_controls,
    audience,
    revenue,
    publishing_defaults,
    members: members.slice(0, 10),
  };
}
