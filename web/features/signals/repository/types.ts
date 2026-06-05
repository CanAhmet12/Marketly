import type { ChannelSignal } from "@/features/channel/types";
import type { SignalLifecyclePhase, SignalStatusKey } from "@/features/signals/domain/signal-meta";
import type { MarketAssetCategory } from "@/features/markets/types";

/** Sinyaller listesi satırı — mock katalog + üretim `signals` tablosu ile hizalı */
export type SignalsPageRow = ChannelSignal & {
  creator_display: string;
  detail_href: string;
  asset_display_name: string;
};

export type SignalStrategy = "scalp" | "swing" | "long";

export type VolatilityHint = "low" | "medium" | "high";
export type SentimentAlignment = "bullish" | "bearish" | "neutral";
export type ThesisGrade = "A" | "B" | "C";
export type CommunityBias = "bullish" | "bearish" | "mixed";

/** Ücretli / abonelik ekonomisi — mock zenginleştirme */
export type SignalAccessTier = "public" | "premium" | "subscriber_only" | "archived_premium" | "preview_only";

export type SignalAnalystCard = {
  id: string;
  display: string;
  avatar_url: string | null;
  verified: boolean;
  follower_count: number;
  accuracy: number | null;
  specialties?: string[] | null;
  tier?: string;
  /** Profil strateji özeti — güven bloğunda */
  strategy_style?: string | null;
};

/** Feed kartı — sparkline + analist zenginleştirmesi */
export type SignalsFeedRow = SignalsPageRow & {
  sparkline: number[];
  assetCategory: MarketAssetCategory;
  strategy: SignalStrategy;
  riskRewardLabel: string | null;
  /** Sayısal R/R; etiket ile uyumlu */
  risk_reward_ratio: number | null;
  entryZoneLabel: string | null;
  status_key: SignalStatusKey;
  expires_at: string | null;
  analyst: SignalAnalystCard;
  lifecycle_phase: SignalLifecyclePhase;
  /** Son N sinyal isabeti (mock / ileride RPC) */
  signal_hit_rate_lookback_pct: number | null;
  /** Analist kümülatif kazanma oranı — çoğunlukla `analyst.accuracy` ile dolar */
  analyst_win_rate_pct: number | null;
  volatility_hint: VolatilityHint;
  sentiment_alignment: SentimentAlignment;
  timeframe_category: string;
  /** 0–100 tazelik skoru (yaş + etkileşim) */
  freshness_score: number;
  community_copies_24h: number;
  discussion_active: boolean;
  community_bias: CommunityBias;
  creator_replied_recently: boolean;
  thesis_grade: ThesisGrade;
  /** Açık sinyallerde kısa vadeli fiyat uyumu önizlemesi (mock) */
  performance_preview_pct: number | null;
  signal_access: SignalAccessTier;
  /** Strateji / ürün paketi etiketi — koleksiyon rayları için */
  signal_package_label: string | null;
  /** Kilitliyken kart üstünde gösterilen kısa metin */
  premium_preview_snippet: string | null;
  /** 24 saatte abone kopyası (mock tahmin) */
  subscriber_copies_24h: number;
  /** Üyelik odası / premium tartışma ipucu */
  premium_discussion: boolean;
  /** Strateji güncellemesi ping'i */
  strategy_update_ping: boolean;
};

/** `/signals` yatay vitrin şeritleri */
export type SignalsMarketplaceRail = {
  id: string;
  title: string;
  subtitle?: string;
  rows: SignalsFeedRow[];
};

/** Keşfet sinyal paneli — profil alanları önceden çözülmüş */
export type DiscoverSignalCardRow = ChannelSignal & {
  creatorDisplay: string;
  creatorAvatarUrl: string | null;
};

/** İzleme / portföy ile kişiselleştirilmiş sinyal yüzeyi */
export type PersonalizedSignalRelevanceRow = {
  id: string;
  symbol: string;
  direction: string;
  confidence: number;
  analystDisplay: string;
  href: string;
  reason: string;
};

export type PersonalizedSignalRelevance = {
  headline: string;
  rows: readonly PersonalizedSignalRelevanceRow[];
};

export function emptyPersonalizedSignalRelevance(): PersonalizedSignalRelevance {
  return { headline: "Kişiselleştirilmiş sinyal bekleniyor", rows: [] };
}
