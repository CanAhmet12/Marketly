import type { FeedPost } from "@/features/feed/types";
import { authorAvatarSrc } from "@/features/feed/feed-display";
import { MOCK_PROFILE_BY_ID, MOCK_PROFILES, type MockProfileRow } from "@/mock/fixtures/profiles";

export type DiscoverTopicEcosystem = {
  id: string;
  title: string;
  summary: string;
  discussionCount: number;
  creatorCount: number;
  pulseLine: string;
  href: string;
};

const TOPIC_SEED: Omit<DiscoverTopicEcosystem, "id">[] = [
  {
    title: "XU100 & bankacılık",
    summary: "Endeks kırılımları, takas ve bilanço sonrası fiyatlama.",
    discussionCount: 842,
    creatorCount: 28,
    pulseLine: "Bugün 14 pulse · 6 canlı tartışma",
    href: "/results?q=XU100&tab=communities",
  },
  {
    title: "Kripto likidite",
    summary: "BTC/ETH akışı, funding ve borsa derinliği okumaları.",
    discussionCount: 1204,
    creatorCount: 41,
    pulseLine: "Son 24s · 22 içerik",
    href: "/results?q=BTC&tab=communities",
  },
  {
    title: "Döviz & TCMB",
    summary: "Kur volatilitesi, faiz kararı öncesi senaryolar.",
    discussionCount: 560,
    creatorCount: 19,
    pulseLine: "Haftalık özet güncellendi",
    href: "/results?q=USDTRY&tab=communities",
  },
  {
    title: "VIOP & kaldıraç",
    summary: "Straddle maliyeti, teminat ve rol yönetimi.",
    discussionCount: 318,
    creatorCount: 14,
    pulseLine: "5 yeni analiz",
    href: "/results?q=VIOP&tab=communities",
  },
  {
    title: "Hisse derinliği",
    summary: "THYAO, ASELS, GARAN — sipariş ve hacim katmanları.",
    discussionCount: 495,
    creatorCount: 22,
    pulseLine: "12 sinyal aktif",
    href: "/results?q=THYAO&tab=communities",
  },
  {
    title: "Altın & emtia",
    summary: "Ons–gram ayrışması ve risk iştahı korelasyonu.",
    discussionCount: 267,
    creatorCount: 11,
    pulseLine: "3 uzun video",
    href: "/results?q=XAUUSD&tab=communities",
  },
];

/** Keşfet alt bölüm — konu hatları (chip bulutu değil; editoryal satırlar). */
export function getDiscoverTopicEcosystems(): DiscoverTopicEcosystem[] {
  return TOPIC_SEED.map((t, i) => ({
    id: `discover-topic-${i + 1}`,
    ...t,
  }));
}

export type DiscoverCreatorSpotlightRow = {
  userId: string;
  channelHref: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  lensLabel: string;
  specialty: string;
  activeFormatLabel: string;
  proofLabel: string;
};

const LENS_ROTATION = ["Bu hafta yükselen", "Bu konuda uzman", "Yeni keşif", "Aktif yayın", "Derin analiz", "Topluluk favorisi"] as const;

const FORMAT_ROTATION = ["Pulse · Video", "Sinyal · Analiz", "Canlı · Pulse", "Video · Makro", "VIOP · Hisse", "Kripto · On-chain"] as const;

function proofFromProfile(p: MockProfileRow, i: number): string {
  const pulse = 2 + (i * 7) % 12;
  const sig = p.signal_accuracy != null ? ` · sinyal güveni %${p.signal_accuracy}` : "";
  return `Son 7 gün · ${pulse} kısa içerik${sig}`;
}

/** Üst medya bantlarında görünen üreticileri düşürerek keşif bağlamı değişir. */
export function getDiscoverCreatorSpotlightRows(excludeUserIds: ReadonlySet<string>): DiscoverCreatorSpotlightRow[] {
  const picked: MockProfileRow[] = [];
  for (const p of MOCK_PROFILES) {
    if (excludeUserIds.has(p.id)) continue;
    picked.push(p);
    if (picked.length >= 6) break;
  }
  const source = picked.length > 0 ? picked : MOCK_PROFILES.slice(0, 6);
  return source.slice(0, 6).map((p, i) => ({
    userId: p.id,
    channelHref: `/channel/${p.id}`,
    displayName: p.full_name ?? p.username,
    handle: `@${p.username}`,
    avatarUrl: p.avatar_url,
    lensLabel: LENS_ROTATION[i % LENS_ROTATION.length]!,
    specialty: p.specialties?.[0] ?? p.strategy_style ?? "Piyasa analizi",
    activeFormatLabel: FORMAT_ROTATION[i % FORMAT_ROTATION.length]!,
    proofLabel: proofFromProfile(p, i),
  }));
}

/** Üreticiler sekmesi — feed satırından kompakt spotlight (mock profil ile zenginleştirilir). */
export function mapFeedPostToCreatorSpotlightRow(post: FeedPost, index: number): DiscoverCreatorSpotlightRow {
  const prof = MOCK_PROFILE_BY_ID[post.user_id];
  const lensLabel = LENS_ROTATION[index % LENS_ROTATION.length]!;
  const specialty = prof?.specialties?.[0] ?? post.asset_tag?.replace(/^#/, "") ?? "Çok varlıklı içerik";
  const type = (post.type ?? "").toLowerCase();
  let activeFormatLabel = "Gönderi · Akış";
  if (type === "pulse" || type === "short") activeFormatLabel = "Pulse";
  else if (type === "video") activeFormatLabel = "Uzun video";
  else if (type === "live") activeFormatLabel = "Canlı";
  else if (type === "signal") activeFormatLabel = "Sinyal";
  const proofLabel = prof
    ? `${formatFollowers(prof.follower_count)} takipçi${prof.verified ? " · doğrulanmış" : ""}`
    : `${formatFollowers(post.views_count || 0)} görüntülenme`;

  return {
    userId: post.user_id,
    channelHref: `/channel/${post.user_id}`,
    displayName: post.author_name,
    handle: post.author_handle ?? `@user`,
    avatarUrl: authorAvatarSrc(post),
    lensLabel,
    specialty,
    activeFormatLabel,
    proofLabel,
  };
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
