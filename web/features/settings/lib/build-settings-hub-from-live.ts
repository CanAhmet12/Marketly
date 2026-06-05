import type { AccountControlHubPayload } from "@/features/settings/domain/types";
import type { Profile } from "@/lib/supabase/types";

export type SettingsLiveStats = {
  followingCount: number;
  followersCount: number;
  savedCount: number;
  watchlistCount: number;
  postsCount: number;
  hasBio: boolean;
  hasAvatar: boolean;
  hasUsername: boolean;
  notificationFieldsFilled: number;
  notificationFieldsTotal: number;
};

function profileCompletenessPct(stats: SettingsLiveStats, profile: Profile | null): number {
  let filled = 0;
  let total = 5;
  if (profile?.full_name?.trim()) filled += 1;
  if (profile?.username?.trim()) filled += 1;
  if (profile?.bio?.trim()) filled += 1;
  if (profile?.avatar_url?.trim()) filled += 1;
  if (stats.watchlistCount > 0 || stats.followingCount > 0) filled += 1;
  return Math.round((filled / total) * 100);
}

/** Repository hub + canlı sayaçlardan türetilmiş hesap özeti. */
export function buildSettingsHubFromLive(
  base: AccountControlHubPayload,
  stats: SettingsLiveStats,
  profile: Profile | null,
  isCreatorSurface: boolean,
): AccountControlHubPayload {
  const completeness = profileCompletenessPct(stats, profile);
  const creatorReady = stats.postsCount >= 3;
  const contentReady = stats.postsCount > 0 || stats.savedCount > 0;

  const intel_lines = [
    { id: "completeness", label: "Profil doluluk", value: `%${completeness}` },
    { id: "watch", label: "İzleme listesi", value: stats.watchlistCount > 0 ? `${stats.watchlistCount} sembol` : "Henüz sembol yok" },
    { id: "saved", label: "Kayıtlı içerik", value: stats.savedCount > 0 ? `${stats.savedCount} gönderi` : "Henüz kayıt yok" },
    { id: "follow", label: "Takip ağı", value: stats.followingCount > 0 ? `${stats.followingCount} üretici` : "Takip başlatılmadı" },
    { id: "content", label: "İçerik hazırlığı", value: contentReady ? "Koleksiyon veya üretim var" : "Keşfet ile başla" },
  ];

  if (isCreatorSurface) {
    intel_lines.push({
      id: "creator",
      label: "Üretici hazırlığı",
      value: creatorReady ? `${stats.postsCount} gönderi yayında` : "İlk gönderilerini paylaş",
    });
  }

  const notifCoverage =
    stats.notificationFieldsTotal > 0
      ? Math.round((stats.notificationFieldsFilled / stats.notificationFieldsTotal) * 100)
      : null;

  return {
    ...base,
    subline: "Hesap ve tercihlerin canlı veriden özetleniyor.",
    account_overview: {
      trust_line: profile?.verified ? "Doğrulanmış hesap" : "Standart hesap",
      verification_line: profile?.verified ? "Doğrulama aktif" : "Doğrulama başvurusu yok",
      premium_line: profile?.tier && profile.tier !== "free" ? `${profile.tier} katmanı` : "Ücretsiz katman",
      session_hint: "Bu cihazda oturum açık",
      login_history_hint: "Giriş geçmişi yakında",
    },
    personalization: {
      confidence_line: completeness >= 70 ? "Profil güçlü" : completeness >= 40 ? "Profil oluşuyor" : "Soğuk başlangıç",
      exploration_line: stats.followingCount >= 5 ? "Geniş takip ağı" : stats.followingCount > 0 ? "Takip ağı büyüyor" : "Keşif için takip ekle",
      novelty_line: stats.savedCount >= 5 ? "Kayıtlı içerik çeşitliliği var" : "Yeni içerik keşfi açık",
      drift_line: stats.watchlistCount > 0 ? "İzleme listesi tanımlı" : "Sembol izleme boş",
      market_focus_line:
        stats.watchlistCount > 0 ? `${stats.watchlistCount} sembol izleniyor` : stats.savedCount > 0 ? "Kayıtlardan tema çıkarılıyor" : "Piyasa odağı henüz belirgin değil",
      creator_cluster_hint:
        stats.followingCount > 0 ? `${stats.followingCount} üretici takipte` : "Öneri belleği etkileşimle oluşur",
      intel_lines,
      muted: base.personalization.muted,
    },
    creator: {
      ...base.creator,
      visible: isCreatorSurface,
      headline: creatorReady ? "Üretici kontrolleri aktif" : "Üretici yüzeyi",
      bullets: creatorReady
        ? [`${stats.postsCount} gönderi`, stats.followersCount > 0 ? `${stats.followersCount} takipçi` : "Takipçi sayısı oluşuyor"]
        : ["İlk gönderini paylaşarak kanalını aç"],
    },
    membership: {
      ...base.membership,
      billing_hint: notifCoverage != null ? `Bildirim kapsamı %${notifCoverage}` : base.membership.billing_hint,
    },
  };
}
