/** Sinyal tartışma / thread satırı — kronolojik evrim */
export type SignalThreadEntryKind =
  | "creator_update"
  | "community_reply"
  | "quote_reply"
  | "thesis_refine"
  | "market_reaction"
  | "partial_tp"
  | "macro_update"
  | "follow_up_signal";

export type SignalThreadEntry = {
  id: string;
  kind: SignalThreadEntryKind;
  /** creator | member | analyst */
  role: "creator" | "member" | "analyst";
  displayName: string;
  body: string;
  at: string;
  /** Alıntı yanıtı için kısa bağlam */
  quoteSnippet?: string;
  sentiment?: "bullish" | "bearish" | "neutral";
};

export type SignalThreadReactions = {
  bullish: number;
  bearish: number;
  tracking: number;
  copied: number;
  disagreed: number;
};

export type SignalThreadPack = {
  signalId: string;
  entries: SignalThreadEntry[];
  reactions: SignalThreadReactions;
  replyCount: number;
  quoteCount: number;
  /** Topluluk katılım hissi — mock yüzdeler */
  sentimentSplit: { bullPct: number; bearPct: number; neutralPct: number };
  lastCreatorUpdateAt: string | null;
  pinnedNote: string | null;
};

/** Varlık sayfası — sinyal tartışma topluluğu özeti */
export type AssetSignalCommunityPulse = {
  activeThreadPosts: number;
  hotSignalsCount: number;
  replyVelocity24h: number;
  sentimentParticipation: { bull: number; bear: number; neutral: number };
  analystConsensus: "bullish" | "bearish" | "mixed";
  trendingSnippet: string;
};

/** Supabase / boş katalog — UI güvenli varsayılan */
export const EMPTY_ASSET_SIGNAL_COMMUNITY_PULSE: AssetSignalCommunityPulse = {
  activeThreadPosts: 0,
  hotSignalsCount: 0,
  replyVelocity24h: 0,
  sentimentParticipation: { bull: 0, bear: 0, neutral: 0 },
  analystConsensus: "mixed",
  trendingSnippet: "Tartışma özeti bağlandığında burada görünür.",
};
