import type { MockNotificationRow, MockNotificationType } from "@/features/social/types";
import { MESSAGES_INBOX_PATH, messagesConversationPath } from "@/features/messages/routes";

import { MOCK_PROFILE_BY_ID, MOCK_PROFILES } from "../fixtures/profiles";

function actor(i: number) {
  const p = MOCK_PROFILES[i % MOCK_PROFILES.length]!;
  return {
    actor_id: p.id,
    display: p.full_name ?? p.username,
    avatar: p.avatar_url,
    verified: p.verified,
  };
}

function hrefFor(type: MockNotificationType, entityId: string | null): string {
  switch (type) {
    case "like":
    case "comment":
    case "mention":
    case "creator_reply":
    case "discussion_mention":
      return entityId ? `/post/${entityId}` : "/";
    case "follow":
      return entityId ? `/channel/${entityId}` : "/discover";
    case "signal_copied":
    case "premium_signal":
    case "signal_lifecycle":
    case "target_stop":
      return entityId ? `/signals?asset=${encodeURIComponent(entityId)}` : "/signals";
    case "price_alert":
    case "watchlist_intel":
    case "market_move":
    case "rising_theme":
      return entityId ? `/markets/${encodeURIComponent(entityId)}` : "/markets";
    case "live_started":
    case "live_recap":
    case "room_invite":
      return entityId ? `/channel/${encodeURIComponent(entityId)}` : "/live";
    case "message":
      return entityId ? messagesConversationPath(entityId) : MESSAGES_INBOX_PATH;
    case "portfolio_intel":
    case "strategy_fit":
      return "/portfolio";
    case "macro_alert":
      return "/economic-calendar";
    case "circle_invite":
      return "/close-friends";
    case "subscription_update":
    case "premium_unlock":
      return entityId ? `/subscriptions/${encodeURIComponent(entityId)}` : "/subscriptions";
    case "recommendation_update":
      return "/discover";
    default:
      return "/settings";
  }
}

function secondaryHref(type: MockNotificationType, entityId: string | null): string | null {
  switch (type) {
    case "premium_signal":
    case "signal_lifecycle":
      return "/watchlist";
    case "portfolio_intel":
      return entityId ? `/markets/${encodeURIComponent(entityId)}` : "/markets";
    case "discussion_mention":
    case "creator_reply":
      return "/discover";
    case "room_invite":
      return "/live";
    default:
      return null;
  }
}

function titleBody(type: MockNotificationType, sym: string, i: number): { title: string; body: string } {
  const m: Record<MockNotificationType, { title: string; body: string }> = {
    like: { title: "Yeni beğeni", body: `Gönderiniz beğenildi (${i + 1}).` },
    comment: { title: "Yorum zinciri", body: `${sym}: tartışmada yeni katman.` },
    follow: { title: "Yeni takipçi", body: "Profilinizi takip etmeye başladı." },
    signal_copied: { title: "Sinyal kopyalandı", body: `${sym} sinyaliniz kopyalandı.` },
    price_alert: { title: "Watchlist uyarısı", body: `${sym} bant kırılımına yaklaştı.` },
    live_started: { title: "Canlı yayın", body: "Takip ettiğiniz içerikçi yayına başladı." },
    mention: { title: "Bahsedilme", body: `Gönderide @${sym} ile etiketlendiniz.` },
    message: { title: "Direkt mesaj", body: "Yeni bir mesajınız var." },
    market_move: { title: "Momentum kayması", body: `${sym} seans içi ivme genişledi.` },
    system: { title: "Güvenlik özeti", body: "Oturum doğrulaması tamamlandı (mock)." },
    premium_signal: { title: "Premium sinyal güncellemesi", body: `${sym} hedef bandı revize edildi.` },
    signal_lifecycle: { title: "Sinyal yaşam döngüsü", body: `${sym} pozisyonu “aktif takip” aşamasında.` },
    target_stop: { title: "Hedef / stop olayı", body: `${sym} için kısmi realize önerisi (mock).` },
    room_invite: { title: "Üretici odası", body: "Özel oda daveti: yayın öncesi brifing." },
    circle_invite: { title: "Özel daire daveti", body: "Yakın çevre kanalına katılım isteği." },
    creator_reply: { title: "Üretici yanıtı", body: `Tez gönderinize resmi yanıt: ${sym}.` },
    discussion_mention: { title: "Tartışma mention", body: `${sym} konusunda sizi etiketlediler.` },
    recommendation_update: { title: "Öneri güncellemesi", body: "Akış ağırlıkları ilgi grafiğinize göre yenilendi." },
    portfolio_intel: { title: "Portföy istihbaratı", body: `${sym} ağırlığı strateji profilinize yakın.` },
    watchlist_intel: { title: "Liste uyumu", body: `${sym} izleme listenizle korelasyon yükseldi.` },
    macro_alert: { title: "Makro uyarı", body: `${sym} faiz eğrisi hassasiyeti arttı (mock).` },
    subscription_update: { title: "Abonelik değişimi", body: "Yeni üyelik katmanı erişimi açıldı." },
    premium_unlock: { title: "Premium kilidi", body: "Arşiv + sinyal masası erişimi aktifleşti." },
    live_recap: { title: "Canlı özet", body: "Son yayında bahsedilen varlıklar paketlendi." },
    strategy_fit: { title: "Strateji uyumu", body: `${sym} pozisyonu risk bütçenize uyumlu görünüyor.` },
    rising_theme: { title: "Yükselen tema", body: `${sym} teması keşfette ivme kazandı.` },
  };
  return m[type];
}

const ROTATION: MockNotificationType[] = [
  "premium_signal",
  "signal_lifecycle",
  "target_stop",
  "room_invite",
  "circle_invite",
  "creator_reply",
  "discussion_mention",
  "recommendation_update",
  "portfolio_intel",
  "watchlist_intel",
  "macro_alert",
  "subscription_update",
  "premium_unlock",
  "live_recap",
  "strategy_fit",
  "rising_theme",
  "like",
  "comment",
  "follow",
  "signal_copied",
  "price_alert",
  "live_started",
  "mention",
  "message",
  "market_move",
  "system",
];

/** Alıcı `userId` — tüm satırlar bu kullanıcıya ait */
export function getMockNotificationsForUser(userId: string): MockNotificationRow[] {
  const rows: MockNotificationRow[] = [];
  const postIds = ["mock-post-001", "mock-post-002", "mock-post-003"];
  const creators = MOCK_PROFILES.slice(0, 3).map((p) => p.id);

  for (let i = 0; i < 28; i++) {
    const type = ROTATION[i % ROTATION.length]!;
    const a = actor(i + 2);
    const sym = ["BTC", "THYAO", "ETH", "XU100", "GLD", "TSLA"][i % 6]!;
    const entity_id =
      type === "message"
        ? `dm-mock-${String((i % 3) + 1).padStart(2, "0")}`
        : type === "follow" || type === "live_started" || type === "live_recap" || type === "room_invite"
          ? a.actor_id
          : type === "like" || type === "comment" || type === "mention" || type === "creator_reply" || type === "discussion_mention"
            ? postIds[i % postIds.length]!
            : type === "subscription_update" || type === "premium_unlock"
              ? creators[i % creators.length] ?? a.actor_id
              : sym;

    const { title, body } = titleBody(type, sym, i);
    const created = new Date(Date.UTC(2026, 4, 16 - (i % 3), 8 + (i % 9), (i * 7) % 60)).toISOString();
    const read_at = i % 5 === 0 ? created : i % 11 === 2 ? new Date(new Date(created).getTime() + 60_000).toISOString() : null;

    const batch_key =
      type === "market_move" && i % 9 < 3 ? `macro-pack-${Math.floor(i / 9)}` : type === "rising_theme" && i % 7 === 0 ? "theme-rise" : null;

    const importance: "critical" | "high" | "normal" | undefined =
      type === "target_stop" || type === "macro_alert" ? "critical" : type === "premium_signal" || type === "portfolio_intel" ? "high" : undefined;

    rows.push({
      id: `ntf-mock-${String(i + 1).padStart(3, "0")}`,
      user_id: userId,
      actor_id: a.actor_id,
      type,
      entity_type:
        type === "message"
          ? "conversation"
          : type === "like" || type === "comment" || type === "mention" || type === "creator_reply" || type === "discussion_mention"
            ? "post"
            : type === "follow" || type === "live_started" || type === "live_recap" || type === "room_invite"
              ? "profile"
              : type === "signal_copied" || type === "premium_signal" || type === "signal_lifecycle" || type === "target_stop"
                ? "signal"
                : type === "price_alert" || type === "market_move" || type === "watchlist_intel" || type === "rising_theme"
                  ? "asset"
                  : type === "circle_invite"
                    ? "circle"
                    : type === "subscription_update" || type === "premium_unlock"
                      ? "subscription"
                      : type === "portfolio_intel" || type === "strategy_fit"
                        ? "portfolio"
                        : type === "recommendation_update"
                          ? "feed"
                          : "system",
      entity_id,
      title,
      body,
      read_at,
      created_at: created,
      actor_display: a.display,
      actor_avatar_url: a.avatar,
      actor_verified: a.verified,
      action_href: hrefFor(type, entity_id),
      secondary_href: secondaryHref(type, entity_id),
      batch_key,
      importance,
      relevance_token: type === "rising_theme" ? sym : type === "recommendation_update" ? "keşif" : null,
    });
  }
  return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function mockNotificationActor(actorId: string) {
  return MOCK_PROFILE_BY_ID[actorId];
}
