/** Öğrenen öneri / adaptasyon yüzeyi — repository üzerinden okunur */

export type RecommendationAdaptationSnapshot = {
  overallConfidence: number;
  explorationShare: number;
  fatigueIndex: number;
  /** Kısa editorial ipucu */
  driftLabel: string | null;
  /** En fazla 2 satır, premium ton */
  hints: readonly string[];
  subline: string;
  coldData: boolean;
};

export type AdaptiveLearningRecord =
  | {
      type: "feed_impression";
      creatorId: string;
      assetUpper: string | null;
      format: string;
      topicTokens: readonly string[];
    }
  | { type: "watch_anchor"; creatorId: string; assetUpper: string | null; format: string }
  | { type: "discover_tab_view"; tab: string }
  | { type: "negative_creator"; creatorId: string }
  | { type: "negative_theme"; token: string }
  | { type: "negative_format"; format: string }
  | { type: "positive_creator"; creatorId: string }
  | { type: "recommendation_rail_view"; surface: string }
  | { type: "soft_post_skip"; creatorId: string };
