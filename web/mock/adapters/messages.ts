import type { MockConversationRow, MockMessageRow } from "@/features/social/types";

import { MOCK_PROFILE_BY_ID, MOCK_PROFILES } from "../fixtures/profiles";

function iso(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

function seedText(i: number) {
  const lines = [
    "Seviye kırılımını birlikte teyit edelim.",
    "Makro takvimde bugün ECB var — dikkat.",
    "Portföy ağırlıklarını güncelledim, paylaşayım mı?",
    "Kısa vadede stopları sıkı tutuyorum.",
    "Akşam yayınında detay anlatırım.",
  ];
  return lines[i % lines.length]!;
}

const intel = (heat: 0 | 1 | 2, v: string, m: string, t: string) => ({ heat, velocity_label: v, market_line: m, trust_label: t });

export function getMockConversationsForUser(userId: string): MockConversationRow[] {
  const a = MOCK_PROFILES[0]!;
  const b = MOCK_PROFILES[1]!;
  const c = MOCK_PROFILES[2]!;
  const d = MOCK_PROFILES[3]!;
  const e = MOCK_PROFILES[4] ?? MOCK_PROFILES[0]!;

  const dm1: MockConversationRow = {
    id: "dm-mock-01",
    is_group: false,
    title: a.full_name ?? a.username,
    subtitle: `@${a.username}`,
    avatar_url: a.avatar_url,
    participant_ids: [userId, a.id],
    online_participant_ids: [a.id],
    unread_count: 2,
    updated_at: iso(12),
    last_message: {
      id: "msg-seed-101",
      sender_id: a.id,
      content: "Yarın seans öncesi risk notunu attım.",
      created_at: iso(12),
      read_at: null,
    },
    kind: "creator_dm",
    context: { asset_tag: "BTC", signal_href: "/signals?asset=BTC", discussion_href: "/discover" },
    intel: intel(2, "Hızlı yanıt", "BTC · kısa vade odak", "Üretici güveni yüksek"),
  };

  const dm2: MockConversationRow = {
    id: "dm-mock-02",
    is_group: false,
    title: b.full_name ?? b.username,
    subtitle: `@${b.username}`,
    avatar_url: b.avatar_url,
    participant_ids: [userId, b.id],
    online_participant_ids: [],
    unread_count: 0,
    updated_at: iso(180),
    last_message: {
      id: "msg-seed-201",
      sender_id: userId,
      content: "Teşekkürler, grafik netleşti.",
      created_at: iso(180),
      read_at: iso(179),
    },
    kind: "support",
    context: { portfolio_note: "Risk çerçevesi hizalaması" },
    intel: intel(0, "Rahat tempo", "Genel piyasa", "Destek hattı"),
  };

  const dm3: MockConversationRow = {
    id: "dm-mock-03",
    is_group: false,
    title: c.full_name ?? c.username,
    subtitle: `@${c.username}`,
    avatar_url: c.avatar_url,
    participant_ids: [userId, c.id],
    online_participant_ids: [c.id],
    unread_count: 1,
    updated_at: iso(45),
    last_message: {
      id: "msg-seed-301",
      sender_id: c.id,
      content: "Canlıda VIOP tarafını da konuşalım mı?",
      created_at: iso(45),
      read_at: null,
    },
    kind: "room_side",
    context: { room_href: "/live", asset_tag: "XU100" },
    intel: intel(1, "Oda senkron", "XU100 · endeks", "Oda köprüsü aktif"),
  };

  const grp: MockConversationRow = {
    id: "dm-mock-04",
    is_group: true,
    title: "BIST Gece Sohbeti",
    subtitle: "4 üye",
    avatar_url: null,
    participant_ids: [userId, a.id, b.id, d.id],
    online_participant_ids: [b.id, d.id],
    unread_count: 5,
    updated_at: iso(8),
    last_message: {
      id: "msg-seed-401",
      sender_id: d.id,
      content: "Endeks + bankacılık akışı birlikte hareket ediyor.",
      created_at: iso(8),
      read_at: null,
    },
    kind: "market_debate",
    context: { asset_tag: "XU100", discussion_href: "/discover" },
    intel: intel(2, "Yoğun tartışma", "Bankacılık + endeks", "Çoklu tez"),
  };

  const premiumDm: MockConversationRow = {
    id: "dm-mock-05",
    is_group: false,
    title: d.full_name ?? d.username,
    subtitle: "Premium üye sohbeti",
    avatar_url: d.avatar_url,
    participant_ids: [userId, d.id],
    online_participant_ids: [],
    unread_count: 3,
    updated_at: iso(22),
    last_message: {
      id: "msg-seed-501",
      sender_id: d.id,
      content: "Bu haftanın sinyal masası özeti hazır.",
      created_at: iso(22),
      read_at: null,
    },
    kind: "premium_member",
    context: { signal_href: "/signals", room_href: "/live" },
    intel: intel(2, "Yüksek katılım", "Sinyal masası", "Premium güven"),
  };

  const circle: MockConversationRow = {
    id: "dm-mock-06",
    is_group: true,
    title: "Yakın çevre · strateji",
    subtitle: "Özel daire",
    avatar_url: null,
    participant_ids: [userId, a.id, c.id],
    online_participant_ids: [a.id],
    unread_count: 1,
    updated_at: iso(55),
    last_message: {
      id: "msg-seed-601",
      sender_id: a.id,
      content: "Portföy kesişimi: THYAO / XU100.",
      created_at: iso(55),
      read_at: null,
    },
    kind: "circle_private",
    context: { asset_tag: "THYAO", portfolio_note: "Daire notu", discussion_href: "/close-friends" },
    intel: intel(1, "Dar daire", "THYAO · BIST", "Yakın çevre"),
  };

  const signalThread: MockConversationRow = {
    id: "dm-mock-07",
    is_group: true,
    title: "Sinyal thread · ETH",
    subtitle: "Tartışma bağlantılı",
    avatar_url: null,
    participant_ids: [userId, b.id, e.id],
    online_participant_ids: [],
    unread_count: 4,
    updated_at: iso(5),
    last_message: {
      id: "msg-seed-701",
      sender_id: e.id,
      content: "Hedef revizyonu için oylama açalım mı?",
      created_at: iso(5),
      read_at: null,
    },
    kind: "signal_thread",
    context: { asset_tag: "ETH", signal_href: "/signals?asset=ETH", discussion_href: "/discover" },
    intel: intel(2, "Anlık yoğunluk", "ETH · volatilite", "Thread güveni"),
  };

  const liveWatch: MockConversationRow = {
    id: "dm-mock-08",
    is_group: true,
    title: "Canlı izleme · akşam",
    subtitle: "Geçici oda sohbeti",
    avatar_url: null,
    participant_ids: [userId, c.id, d.id],
    online_participant_ids: [c.id],
    unread_count: 0,
    updated_at: iso(400),
    last_message: {
      id: "msg-seed-801",
      sender_id: c.id,
      content: "Yayın bitti — özet notu paylaşıyorum.",
      created_at: iso(400),
      read_at: iso(399),
    },
    kind: "live_watch",
    context: { room_href: "/live", asset_tag: "GLD" },
    intel: intel(0, "Sakin", "GLD · makro", "Etkinlik tamamlandı"),
  };

  const strategy: MockConversationRow = {
    id: "dm-mock-09",
    is_group: true,
    title: "Strateji masası",
    subtitle: "3 üye",
    avatar_url: null,
    participant_ids: [userId, a.id, d.id],
    online_participant_ids: [],
    unread_count: 2,
    updated_at: iso(30),
    last_message: {
      id: "msg-seed-901",
      sender_id: a.id,
      content: "Risk bütçesi: haftalık güncelleme.",
      created_at: iso(30),
      read_at: null,
    },
    kind: "strategy",
    context: { portfolio_note: "/portfolio", discussion_href: "/discover" },
    intel: intel(1, "Derin tempo", "Portföy bağlantısı", "Strateji güveni"),
  };

  return [signalThread, grp, premiumDm, dm1, dm3, strategy, circle, liveWatch, dm2];
}

export function getMockSeedMessages(conversationId: string, userId: string): MockMessageRow[] {
  const conv = getMockConversationsForUser(userId).find((c) => c.id === conversationId);
  if (!conv) return [];
  const other = conv.participant_ids.find((p) => p !== userId) ?? conv.participant_ids[0]!;
  const base: MockMessageRow[] = [];
  for (let i = 0; i < 6; i++) {
    const from = i % 3 === 0 ? userId : conv.is_group ? conv.participant_ids[(i % conv.participant_ids.length) || 0]! : other;
    base.push({
      id: `msg-seed-${conversationId}-${i}`,
      conversation_id: conversationId,
      sender_id: from,
      content: seedText(i),
      created_at: iso(300 - i * 22),
      read_at: i > 2 ? iso(299 - i * 22) : null,
    });
  }
  return base.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function mockParticipantProfile(id: string) {
  return MOCK_PROFILE_BY_ID[id];
}
