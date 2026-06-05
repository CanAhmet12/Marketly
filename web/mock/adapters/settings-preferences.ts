import type { MockSettingsBundle } from "@/features/social/types";

export function getDefaultMockSettings(profile?: {
  display_name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
} | null): MockSettingsBundle {
  return {
    profile: {
      display_name: profile?.display_name ?? "Marketly Kullanıcısı",
      username: profile?.username ?? "marketly_user",
      bio: profile?.bio ?? "Mock profil — web ayarları ile düzenlenebilir.",
      avatar_url: profile?.avatar_url ?? null,
    },
    notifications: {
      push_enabled: true,
      email_digest: false,
      likes: true,
      comments: true,
      follows: true,
      signals: true,
      messages: true,
      market: true,
      live: true,
      creator_digest: true,
      watchlist_alerts: true,
      portfolio_alerts: true,
      discussion_alerts: true,
      room_activity: true,
      premium_updates: true,
      macro_alerts: true,
    },
    privacy: {
      profile_public: true,
      show_activity: true,
      allow_mentions_from: "followers",
      read_receipts: true,
      private_circle_visible: false,
      follow_list_public: false,
      discussion_visibility: "followers",
      watch_activity_visible: true,
      signal_copy_visible: true,
      premium_visibility: true,
      room_participation_visible: true,
    },
    appearance: {
      compact_feed: false,
      reduce_motion: false,
    },
    security: {
      two_factor_hint: "off",
    },
  };
}
