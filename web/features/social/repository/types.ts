import type {
  MockConversationRow,
  MockMessageRow,
  MockNotificationRow,
  MockSettingsBundle,
} from "@/features/social/types";

/** Sözleşme adları — mevcut mock tipleriyle hizalı */
export type NotificationItem = MockNotificationRow;
export type Conversation = MockConversationRow;
export type Message = MockMessageRow;
export type SettingsBundle = MockSettingsBundle;

export type CloseFriend = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean;
};

/** Ayarlar varsayılanı için auth profil tohumu */
export type SettingsProfileSeed = {
  display_name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

/** Mesaj balonunda gönderen özeti (mock profil JOIN) */
export type ParticipantProfile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  verified?: boolean;
};
