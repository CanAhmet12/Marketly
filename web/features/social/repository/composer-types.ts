/** Composer / yayın — UI yalnızca SocialRepository üzerinden erişir. */

export type ComposerIntentId =
  | "market_thesis"
  | "market_quick_update"
  | "macro_interpretation"
  | "signal_follow_up"
  | "creator_note"
  | "room_update"
  | "educational_insight"
  | "debate_response"
  | "asset_breakdown"
  | "strategy_commentary"
  | "quote_repost"
  | "repost_commentary"
  | "thread_continue";

export type ComposerIntentOption = {
  id: ComposerIntentId;
  label: string;
  hint: string;
};

export const COMPOSER_INTENT_OPTIONS: ComposerIntentOption[] = [
  { id: "market_thesis", label: "Piyasa tezi", hint: "Ana görüş, senaryo ve risk çerçevesi" },
  { id: "market_quick_update", label: "Hızlı güncelleme", hint: "Seans içi kısa not" },
  { id: "macro_interpretation", label: "Makro yorum", hint: "Politika / veri akışı bağlamı" },
  { id: "signal_follow_up", label: "Sinyal takibi", hint: "Açık çağrıya güncelleme" },
  { id: "creator_note", label: "Üretici notu", hint: "Kişisel stüdyo / marka sesi" },
  { id: "room_update", label: "Oda güncellemesi", hint: "Üretici odasına özel içerik" },
  { id: "educational_insight", label: "Eğitim içgörüsü", hint: "Öğretici, yapılandırılmış anlatım" },
  { id: "debate_response", label: "Münazara yanıtı", hint: "Teze karşı / lehte argüman" },
  { id: "asset_breakdown", label: "Varlık dökümü", hint: "Tek enstrüman derinlemesine" },
  { id: "strategy_commentary", label: "Strateji yorumu", hint: "Portföy / pozisyon çerçevesi" },
  { id: "quote_repost", label: "Alıntılı yayın", hint: "Bağlam + editoryal katman" },
  { id: "repost_commentary", label: "Yeniden paylaşım + not", hint: "Kaynak + kısa yorum" },
  { id: "thread_continue", label: "Zincir devamı", hint: "Mevcut tartışmaya bağlı yayın" },
];

export type ComposerQuoteKind = "post" | "signal" | "discussion";

export type ComposerQuotePreview = {
  kind: ComposerQuoteKind;
  title: string;
  subtitle: string;
  snippet: string;
  metaLine: string;
  href: string;
};

export type ComposerQuotePreviewParams = {
  quotedPostId?: string | null;
  quotedSignalId?: string | null;
  discussionAnchorPostId?: string | null;
};

export type ComposerThreadSeed = {
  replyToPostId: string;
  parentAuthorLine: string;
  parentSnippet: string;
  suggestedPrefix: string;
};

export type ComposerReferenceKind =
  | "asset"
  | "signal"
  | "creator"
  | "topic"
  | "room"
  | "discussion"
  | "watchlist";

export type ComposerReferenceHit = {
  kind: ComposerReferenceKind;
  id: string;
  label: string;
  sublabel: string | null;
  symbol: string | null;
  href: string;
};

export type ComposerDraftPayload = {
  contentKind: "post" | "signal" | "video" | "pulse" | "live";
  content: string;
  title: string;
  assetTag: string;
  intentId: ComposerIntentId | null;
  quotedPostId: string | null;
  replyToPostId: string | null;
  quotedSignalId: string | null;
  discussionAnchorPostId: string | null;
  targetRoomId: string | null;
  targetTopicSlug: string | null;
  /** Yok veya `public` = genel; aksi `creatorId::kind` */
  circleAudienceId?: string | null;
  scheduledPublishAt: string | null;
};

export type ComposerDraft = {
  id: string;
  userId: string;
  updatedAt: string;
  label: string;
  payload: ComposerDraftPayload;
};

export type ComposerPublishSummaryInput = {
  intentId: ComposerIntentId | null;
  contentKind: string;
  assetTag: string | null;
  quotedPostId: string | null;
  replyToPostId: string | null;
  quotedSignalId: string | null;
  discussionAnchorPostId: string | null;
  targetRoomId: string | null;
  targetTopicSlug: string | null;
  circleAudienceId?: string | null;
  scheduledPublishAt: string | null;
  contentPreview: string;
  titlePreview: string | null;
};

export type ComposerPublishSummary = {
  lines: string[];
  warnings: string[];
};
