import { getSignalsRepository } from "@/features/signals/repository";
import type {
  CreatorCommunityIntelligence,
  CreatorCommunityNetworkHints,
  CreatorCommunityRoomsSurface,
  CreatorRoomFeedRow,
  CreatorRoomPinnedNote,
  CreatorRoomSearchHit,
  CreatorRoomSummary,
  CreatorRoomTopParticipant,
  DiscoverCreatorRoomsRail,
  MessagingCreatorRoomDigestItem,
  SignalCreatorRoomLink,
  WatchCreatorRoomsContext,
} from "@/features/social/repository/creator-room-types";
import { MOCK_CREATOR_DIRECTORY } from "@/mock/fixtures/channels";
import { MOCK_PROFILES } from "@/mock/fixtures/profiles";

type Blueprint = {
  key: string;
  label: string;
  kind: CreatorRoomSummary["kind"];
  premium: boolean;
  symbol: string | null;
};

const BLUEPRINTS: Blueprint[] = [
  { key: "general", label: "Genel tartışma", kind: "general", premium: false, symbol: null },
  { key: "premium", label: "Premium üyeler", kind: "premium", premium: true, symbol: null },
  { key: "macro", label: "Makro oda", kind: "macro", premium: false, symbol: null },
  { key: "btc", label: "BTC oda", kind: "asset", premium: false, symbol: "BTC" },
  { key: "strategy", label: "Portföy stratejisi", kind: "strategy", premium: true, symbol: null },
  { key: "daily", label: "Günlük piyasa özeti", kind: "daily", premium: false, symbol: null },
  { key: "edu", label: "Eğitim / analiz", kind: "education", premium: false, symbol: null },
  { key: "sig", label: "Sinyal tartışmaları", kind: "signals", premium: false, symbol: null },
  { key: "live", label: "Canlı piyasa odası", kind: "live_market", premium: false, symbol: null },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function roomHref(creatorId: string, roomId: string): string {
  return `/channel/${encodeURIComponent(creatorId)}?tab=rooms&room=${encodeURIComponent(roomId)}`;
}

export function buildCreatorRoomSummaries(creatorId: string): CreatorRoomSummary[] {
  const h = hash(creatorId);
  return BLUEPRINTS.map((bp, i) => {
    // Tam creatorId kullan; slice(0,8) mock-profile-01 / 02 gibi farklı profillerde çakışıyordu.
    const id = `cr-${creatorId}-${bp.key}`;
    const heat = 40 + ((h + i * 17) % 55);
    return {
      id,
      creator_id: creatorId,
      label: bp.label,
      kind: bp.kind,
      is_premium: bp.premium,
      preview_locked: bp.premium && (h + i) % 3 !== 0,
      heat_label: `${heat} ısı`,
      participant_density_label: `${6 + ((h + i) % 9)} / 100 gönderi`,
      creator_present_label: (h + i) % 4 === 0 ? "Üretici şu an aktif" : "Üretici son 2 saatte aktif",
      last_activity_at: new Date(Date.now() - ((h + i * 41) % 7200) * 1000).toISOString(),
      href: roomHref(creatorId, id),
      linked_symbol: bp.symbol,
      signal_thread_label: bp.kind === "signals" ? "3 açık sinyal bağlantısı" : null,
      premium_badge_label: bp.premium ? "Abone" : null,
    };
  });
}

function buildFeed(creatorId: string, rooms: CreatorRoomSummary[]): CreatorRoomFeedRow[] {
  const h = hash(creatorId);
  const rows: CreatorRoomFeedRow[] = [];
  const kinds: CreatorRoomFeedRow["kind"][] = ["announcement", "thread", "signal_link", "market_note", "highlight", "qa", "creator_reply"];
  rooms.slice(0, 6).forEach((r, i) => {
    rows.push({
      id: `cfeed-${r.id}-${i}`,
      room_id: r.id,
      kind: kinds[(h + i) % kinds.length]!,
      title:
        kinds[(h + i) % kinds.length] === "announcement"
          ? "Günün risk çerçevesi — kısa özet"
          : kinds[(h + i) % kinds.length] === "signal_link"
            ? `${r.linked_symbol ?? "Piyasa"} sinyal zinciri güncellendi`
            : "Tez netleştirme — soru-cevap",
      sub: r.is_premium ? "Premium üyeler için tam metin" : "Açık tartışma · alıntılı yanıtlar",
      href: `${r.href}&focus=feed`,
      pinned: i === 0,
      premium_only_preview: r.is_premium && (h + i) % 2 === 0,
      creator_reacted: (h + i) % 3 === 0,
      created_at: new Date(Date.now() - (i + 1) * 3600_000).toISOString(),
    });
  });
  return rows;
}

function buildPinned(rooms: CreatorRoomSummary[]): CreatorRoomPinnedNote[] {
  const r0 = rooms[0];
  const r1 = rooms[2];
  if (!r0) return [];
  return [
    { id: "pin-1", room_id: r0.id, body: "Bu hafta odada öncelik: faiz volatilitesi ve kur riski.", href: r0.href },
    ...(r1 ? [{ id: "pin-2", room_id: r1.id, body: "Makro masa: ABD verisi sonrası strateji pin’i.", href: r1.href }] : []),
  ];
}

function buildParticipants(creatorId: string): CreatorRoomTopParticipant[] {
  void creatorId;
  return MOCK_PROFILES.slice(0, 4).map((p, i) => ({
    user_id: p.id,
    display: p.full_name ?? p.username,
    score_label: `${80 - i * 12} katkı`,
    premium_member: i === 0,
  }));
}

function buildIntelligence(creatorId: string): CreatorCommunityIntelligence {
  const h = hash(creatorId);
  return {
    active_members_label: `${24 + (h % 40)} aktif üye (7g)`,
    heat_peak_label: `Tepe ısı: ${(h % 12) + 8}.00 UTC`,
    topic_overlap_label: "Makro · BTC · strateji odaları örtüşüyor",
    premium_participation_label: `%${32 + (h % 28)} yanıt premium üyelerden`,
    related_room_labels: ["Sinyal tartışmaları", "Canlı piyasa odası"],
  };
}

function buildNetwork(creatorId: string): CreatorCommunityNetworkHints[] {
  const other = MOCK_CREATOR_DIRECTORY.find((c) => c.id !== creatorId);
  const symRow = getSignalsRepository().getFeedRows().find((r) => r.creator_id === creatorId);
  return [
    {
      id: "n1",
      text: other ? `Örtüşen üretici: ${other.full_name ?? other.username}` : "Örtüşen üretici ağı (mock)",
      href: other ? `/channel/${other.id}?tab=rooms` : "/discover?tab=creators",
    },
    {
      id: "n2",
      text: symRow ? `Paylaşılan sinyal teması: ${symRow.symbol}` : "Çapraz oda: günlük özet",
      href: symRow ? `/signals?asset=${encodeURIComponent(symRow.symbol)}` : "/discover",
    },
  ];
}

export function buildCreatorCommunityRoomsSurface(creatorId: string): CreatorCommunityRoomsSurface {
  const rooms = buildCreatorRoomSummaries(creatorId);
  return {
    creator_id: creatorId,
    rooms,
    feed: buildFeed(creatorId, rooms),
    pinned_notes: buildPinned(rooms),
    top_participants: buildParticipants(creatorId),
    intelligence: buildIntelligence(creatorId),
    network: buildNetwork(creatorId),
  };
}

export function buildDiscoverCreatorRoomsRail(): DiscoverCreatorRoomsRail {
  const spotlight = MOCK_CREATOR_DIRECTORY.slice(0, 5).map((c, i) => {
    const rooms = buildCreatorRoomSummaries(c.id);
    const room = rooms[i % rooms.length]!;
    return {
      room_id: room.id,
      room_label: room.label,
      creator_id: c.id,
      creator_name: c.full_name ?? c.username,
      heat_label: room.heat_label,
      href: room.href,
    };
  });
  return {
    headline: "Üretici odaları — abone ve açık masalar; sinyal ve piyasa ile bağlı.",
    spotlight,
    collaboration_chips: [
      { id: "cc1", label: "Makro zinciri", href: "/discover" },
      { id: "cc2", label: "Sinyal köprüsü", href: "/signals" },
      { id: "cc3", label: "Varlık istihbaratı", href: "/markets" },
    ],
  };
}

export function searchMockCreatorRoomHits(query: string, limit = 20): CreatorRoomSearchHit[] {
  const q = query.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const out: CreatorRoomSearchHit[] = [];
  for (const c of MOCK_CREATOR_DIRECTORY) {
    const rooms = buildCreatorRoomSummaries(c.id);
    const creatorHay = (c.full_name ?? c.username).toLowerCase();
    for (const r of rooms) {
      const blob = `${r.label} ${creatorHay} ${r.linked_symbol ?? ""}`.toLowerCase();
      const score = !terms.length ? 1 : terms.some((t) => blob.includes(t)) ? 3 : 0;
      if (score > 0) {
        out.push({
          id: `srch-${c.id}-${r.id}`,
          room_id: r.id,
          title: r.label,
          subtitle: `${c.full_name ?? c.username} · ${r.heat_label}`,
          creator_name: c.full_name ?? c.username,
          href: r.href,
          premium_badge: r.is_premium,
        });
      }
    }
  }
  out.sort((a, b) => Number(b.premium_badge) - Number(a.premium_badge));
  if (out.length) return out.slice(0, limit);
  return MOCK_CREATOR_DIRECTORY.slice(0, Math.min(4, limit)).map((c) => {
    const r = buildCreatorRoomSummaries(c.id)[0]!;
    return {
      id: `srch-fallback-${c.id}-${r.id}`,
      room_id: r.id,
      title: r.label,
      subtitle: c.full_name ?? c.username,
      creator_name: c.full_name ?? c.username,
      href: r.href,
      premium_badge: r.is_premium,
    };
  });
}

export function buildSignalCreatorRoomLink(signalId: string): SignalCreatorRoomLink | null {
  const row = getSignalsRepository().getFeedRows().find((r) => r.id === signalId);
  if (!row) return null;
  const rooms = buildCreatorRoomSummaries(row.creator_id);
  const room = rooms.find((x) => x.kind === "signals") ?? rooms[0];
  if (!room) return null;
  return {
    href: room.href,
    label: `${room.label} — üretici odası`,
    sub: `${row.symbol} tartışması bu odada bağlanır (mock).`,
  };
}

export function buildWatchCreatorRoomsContext(assetTag: string): WatchCreatorRoomsContext {
  const tag = assetTag.trim().toUpperCase();
  if (!tag) return { lines: [] };
  const rows = getSignalsRepository().getFeedRows().filter((r) => r.symbol.toUpperCase() === tag).slice(0, 2);
  const lines = rows.map((r, i) => {
    const rooms = buildCreatorRoomSummaries(r.creator_id);
    const match = rooms.find((x) => x.linked_symbol === tag) ?? rooms[0]!;
    return {
      id: `wcr-${r.id}-${i}`,
      text: `${r.analyst.display} · ${match.label}`,
      href: roomHref(r.creator_id, match.id),
    };
  });
  if (!lines.length) {
    const c = MOCK_CREATOR_DIRECTORY[hash(tag) % MOCK_CREATOR_DIRECTORY.length]!;
    const r = buildCreatorRoomSummaries(c.id)[0]!;
    return {
      lines: [{ id: "wcr-f", text: `${c.full_name ?? c.username} · ${r.label}`, href: r.href }],
    };
  }
  return { lines };
}

export function buildCreatorRoomNotificationStrip(userId: string | null): { id: string; title: string; href: string }[] {
  void userId;
  const c = MOCK_CREATOR_DIRECTORY[0];
  if (!c) return [];
  const r = buildCreatorRoomSummaries(c.id).find((x) => x.kind === "premium") ?? buildCreatorRoomSummaries(c.id)[0]!;
  return [
    {
      id: "room-strip-1",
      title: `${c.full_name ?? c.username} — ${r.label} güncellendi`,
      href: r.href,
    },
  ];
}

export function buildMessagingCreatorRoomDigest(userId: string | null): MessagingCreatorRoomDigestItem[] {
  void userId;
  const c = MOCK_CREATOR_DIRECTORY[1] ?? MOCK_CREATOR_DIRECTORY[0];
  if (!c) return [];
  const r = buildCreatorRoomSummaries(c.id)[2] ?? buildCreatorRoomSummaries(c.id)[0]!;
  return [{ id: "msg-dig-1", text: `Oda özeti: ${r.label} · 3 yeni yanıt (mock)`, href: r.href }];
}
