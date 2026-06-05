/** Üreticiler directory — tek veri sözleşmesi (mock + Supabase). */

export type CreatorContentFormat = "live" | "video" | "pulse" | "signal" | "post";

export type CreatorDirectoryRow = {
  id: string;
  username: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
  tier: string;
  verified: boolean;
  followerCount: number;
  signalAccuracy: number | null;
  /** Profil uzmanlık etiketleri */
  specialties: string[];
  /** İçerikten türetilen varlık etiketleri */
  assetTags: string[];
  contentFormats: CreatorContentFormat[];
  formatCounts: Partial<Record<CreatorContentFormat, number>>;
  isLive: boolean;
  liveHref: string | null;
  latestHeadline: string | null;
  latestContentHref: string | null;
  latestThumbnailUrl: string | null;
  activeSignalsCount: number;
  bestSignalSymbol: string | null;
  bestSignalConfidence: number | null;
  roomHref: string | null;
  channelHref: string;
  editorPick: boolean;
  rising: boolean;
  createdAt: string;
};

export type CreatorDirectoryPayload = {
  creators: CreatorDirectoryRow[];
  /** Editör seçkisi — en fazla 3 */
  featuredIds: string[];
  /** Canlı yayında olanlar — strip sırası */
  liveNowIds: string[];
  assetPresets: readonly string[];
};
