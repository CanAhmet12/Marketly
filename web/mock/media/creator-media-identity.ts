/**
 * Creator “thumbnail dili” + uzmanlık — feed eşlemesi ve kanal UI için meta.
 * Profil satırları `fixtures/profiles.ts` içinde; burada sadece medya kimliği.
 */

export type MockThumbnailVoice =
  | "aggressive_chart"
  | "neon_crypto"
  | "macro_clean"
  | "bloomberg_data"
  | "live_studio"
  | "news_edition"
  | "education_soft"
  | "viop_practical"
  | "global_indices";

export type CreatorMediaIdentity = {
  profileId: string;
  expertise: string;
  contentTone: string;
  thumbnailVoice: MockThumbnailVoice;
  assetFocus: string;
};

export const CREATOR_MEDIA_IDENTITIES: readonly CreatorMediaIdentity[] = [
  {
    profileId: "mock-profile-01",
    expertise: "BIST + makro akış",
    contentTone: "Analitik, sakin",
    thumbnailVoice: "macro_clean",
    assetFocus: "XU100, bankacılık",
  },
  {
    profileId: "mock-profile-02",
    expertise: "On-chain + BTC/ETH",
    contentTone: "Hızlı, hype kontrollü",
    thumbnailVoice: "neon_crypto",
    assetFocus: "BTC, ETH, SOL",
  },
  {
    profileId: "mock-profile-03",
    expertise: "Fed / ECB gündem",
    contentTone: "Haber odaklı",
    thumbnailVoice: "news_edition",
    assetFocus: "Makro, faiz",
  },
  {
    profileId: "mock-profile-04",
    expertise: "Yeni başlayan eğitim",
    contentTone: "Sade, öğretici",
    thumbnailVoice: "education_soft",
    assetFocus: "Temel kavramlar",
  },
  {
    profileId: "mock-profile-05",
    expertise: "Scalp + likidite",
    contentTone: "Agresif, direkt",
    thumbnailVoice: "aggressive_chart",
    assetFocus: "VIOP, kısa vade",
  },
  {
    profileId: "mock-profile-06",
    expertise: "Makro podcast + portföy (Makro Selin)",
    contentTone: "Stüdyo, sakin anlatım",
    thumbnailVoice: "macro_clean",
    assetFocus: "Faiz eğrisi, ETF",
  },
  {
    profileId: "mock-profile-07",
    expertise: "Grafik laboratuvarı",
    contentTone: "Teknik yoğun",
    thumbnailVoice: "aggressive_chart",
    assetFocus: "Çoklu varlık",
  },
  {
    profileId: "mock-profile-08",
    expertise: "Canlı seans yorumu",
    contentTone: "Etkileşimli, enerjik",
    thumbnailVoice: "live_studio",
    assetFocus: "Seans içi",
  },
  {
    profileId: "mock-profile-09",
    expertise: "Altın & döviz",
    contentTone: "Makro + teknik karışım",
    thumbnailVoice: "macro_clean",
    assetFocus: "XAUUSD, USDTRY",
  },
  {
    profileId: "mock-profile-10",
    expertise: "NASDAQ / ABD seansı",
    contentTone: "Gece seansı, tempolu",
    thumbnailVoice: "global_indices",
    assetFocus: "NDX, SPX",
  },
  {
    profileId: "mock-profile-11",
    expertise: "Derin hisse hikâyesi",
    contentTone: "Kurumsal",
    thumbnailVoice: "bloomberg_data",
    assetFocus: "THYAO, ASELS",
  },
  {
    profileId: "mock-profile-12",
    expertise: "Topluluk + soru-cevap",
    contentTone: "Samimi",
    thumbnailVoice: "education_soft",
    assetFocus: "Başlangıç",
  },
  {
    profileId: "mock-profile-13",
    expertise: "Makro özet",
    contentTone: "Özetleyici",
    thumbnailVoice: "news_edition",
    assetFocus: "Tahminler, veri",
  },
  {
    profileId: "mock-profile-14",
    expertise: "VIOP pratik",
    contentTone: "Uygulamalı",
    thumbnailVoice: "viop_practical",
    assetFocus: "Teminat, straddle",
  },
  {
    profileId: "mock-profile-15",
    expertise: "ETF rotasyonu",
    contentTone: "Küresel bakış",
    thumbnailVoice: "bloomberg_data",
    assetFocus: "Sektör ETF",
  },
  {
    profileId: "mock-profile-16",
    expertise: "FX scalping",
    contentTone: "Volatilite odaklı",
    thumbnailVoice: "aggressive_chart",
    assetFocus: "Majör pariteler",
  },
  {
    profileId: "mock-profile-17",
    expertise: "Bilanço & çarpanlar",
    contentTone: "Veri ağırlıklı",
    thumbnailVoice: "bloomberg_data",
    assetFocus: "KAP, temettü",
  },
  {
    profileId: "mock-profile-18",
    expertise: "Açılış/kapanış host",
    contentTone: "Yayın formatı",
    thumbnailVoice: "live_studio",
    assetFocus: "Genel piyasa",
  },
];

export const CREATOR_MEDIA_BY_PROFILE_ID: Record<string, CreatorMediaIdentity> = Object.fromEntries(
  CREATOR_MEDIA_IDENTITIES.map((c) => [c.profileId, c]),
);
