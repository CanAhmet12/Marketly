import type { MockNotificationType } from "@/features/social/types";

const NOTIFICATION_KIND_LABELS: Record<MockNotificationType, string> = {
  like: "Beğeni",
  comment: "Yorum",
  follow: "Takip",
  signal_copied: "Sinyal",
  price_alert: "Uyarı",
  live_started: "Canlı",
  mention: "Bahset",
  message: "Mesaj",
  market_move: "Piyasa",
  system: "Sistem",
  premium_signal: "Premium",
  signal_lifecycle: "Yaşam",
  target_stop: "Hedef",
  room_invite: "Oda",
  circle_invite: "Daire",
  creator_reply: "Yanıt",
  discussion_mention: "Tartışma",
  recommendation_update: "Öneri",
  portfolio_intel: "Portföy",
  watchlist_intel: "Liste",
  macro_alert: "Makro",
  subscription_update: "Abonelik",
  premium_unlock: "Kilit",
  live_recap: "Özet",
  strategy_fit: "Strateji",
  rising_theme: "Tema",
};

export function getNotificationKindLabel(type: MockNotificationType): string {
  return NOTIFICATION_KIND_LABELS[type] ?? type;
}

/** Kısa göreli zaman — bildirim ve DM listesi */
export function formatSocialRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} sa`;
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function formatMessageDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function isSameCalendarDay(aIso: string, bIso: string): boolean {
  const a = new Date(aIso);
  const b = new Date(bIso);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
