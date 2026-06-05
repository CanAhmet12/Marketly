import type { ChannelSignal } from "@/features/channel/types";
import type {
  ComposerDraft,
  ComposerDraftPayload,
  ComposerPublishSummary,
  ComposerPublishSummaryInput,
  ComposerQuotePreview,
  ComposerReferenceHit,
  ComposerThreadSeed,
} from "@/features/social/repository/composer-types";
import { COMPOSER_INTENT_OPTIONS } from "@/features/social/repository/composer-types";

import { MOCK_PROFILE_BY_ID } from "../fixtures/profiles";
import { MOCK_SIGNAL_ROWS } from "../fixtures/signals";
import { getMockCreatedSignals } from "./upload-store";
import { resolveMockPostSourceById } from "./mock-post-resolve";
import { displayAssetNameForSymbol } from "./signals-source";
import { searchMockCreatorRoomHits } from "./social-creator-rooms-data";
import { searchMockDiscussionHits } from "./social-discussion-data";
import { searchMockTopicCommunityHits } from "./social-community-data";

function snippet(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function resolveSignalById(id: string): ChannelSignal | null {
  const row = MOCK_SIGNAL_ROWS.find((s) => s.id === id);
  if (row) return row;
  return getMockCreatedSignals().find((s) => s.id === id) ?? null;
}

export function buildComposerQuotePreviewForPost(postId: string): ComposerQuotePreview | null {
  const src = resolveMockPostSourceById(postId);
  if (!src) return null;
  const prof = MOCK_PROFILE_BY_ID[src.user_id];
  const author = prof?.full_name ?? prof?.username ?? "Gönderi";
  const handle = prof?.username ? `@${prof.username}` : "@user";
  const body = (src.title?.trim() || src.content || "").trim();
  return {
    kind: "post",
    title: "Alıntı bağlamı",
    subtitle: `${author} · ${handle}`,
    snippet: snippet(body),
    metaLine: src.asset_tag ? `#${src.asset_tag} · gönderi` : "Gönderi",
    href: `/post/${src.id}`,
  };
}

export function buildComposerQuotePreviewForSignal(signalId: string): ComposerQuotePreview | null {
  const s = resolveSignalById(signalId);
  if (!s) return null;
  const prof = MOCK_PROFILE_BY_ID[s.creator_id];
  const creator = prof?.full_name ?? prof?.username ?? "Analist";
  const rationale = (s.rationale ?? "").trim();
  return {
    kind: "signal",
    title: "Sinyal özeti",
    subtitle: `${creator} · ${s.direction} ${s.symbol}`,
    snippet: snippet(rationale || `${s.timeframe} çerçevesinde çağrı.`),
    metaLine: `Güven ${Math.round(s.confidence)}% · ${s.timeframe}`,
    href: `/signals/${s.id}`,
  };
}

export function buildComposerQuotePreviewForDiscussion(postId: string): ComposerQuotePreview | null {
  const direct = resolveMockPostSourceById(postId);
  if (!direct) return null;
  const q = `${direct.title ?? ""} ${direct.content}`.trim();
  const hits = searchMockDiscussionHits(q.slice(0, 24), 6).filter((h) => h.post_id === postId);
  const h = hits[0];
  return {
    kind: "discussion",
    title: "Tartışma hedefi",
    subtitle: h?.author_name ? `${h.author_name} · tartışma` : "Gönderi tartışması",
    snippet: snippet(h?.snippet ?? direct.title?.trim() ?? direct.content),
    metaLine: h ? `${h.reply_count} yanıt · ${h.heat_label}` : direct.asset_tag ? `#${direct.asset_tag}` : "Yeni tartışma akışı",
    href: `/post/${direct.id}`,
  };
}

export function buildComposerThreadSeed(replyToPostId: string | null): ComposerThreadSeed | null {
  if (!replyToPostId?.trim()) return null;
  const src = resolveMockPostSourceById(replyToPostId.trim());
  if (!src) {
    return {
      replyToPostId: replyToPostId.trim(),
      parentAuthorLine: "Üst gönderi (mock dışı veya silinmiş)",
      parentSnippet: "Bağlam yüklenemedi — yine de zincire yazabilirsin.",
      suggestedPrefix: "",
    };
  }
  const prof = MOCK_PROFILE_BY_ID[src.user_id];
  const author = prof?.full_name ?? prof?.username ?? "Yazar";
  const body = snippet(src.title?.trim() || src.content, 120);
  return {
    replyToPostId: src.id,
    parentAuthorLine: `${author} gönderisine devam`,
    parentSnippet: body,
    suggestedPrefix: `↪ ${author}: “${body}” üzerine:\n\n`,
  };
}

export function searchComposerReferencesData(query: string, limit = 14): ComposerReferenceHit[] {
  const q = query.trim();
  if (!q) return [];
  const upper = q.toUpperCase();
  const out: ComposerReferenceHit[] = [];

  if (upper.length >= 2 && upper.length <= 12) {
    out.push({
      kind: "asset",
      id: upper,
      label: upper,
      sublabel: displayAssetNameForSymbol(upper),
      symbol: upper,
      href: `/markets/${encodeURIComponent(upper)}`,
    });
  }

  for (const s of MOCK_SIGNAL_ROWS) {
    if (out.length >= limit) break;
    const hay = `${s.symbol} ${s.rationale ?? ""} ${s.id}`.toLowerCase();
    if (!hay.includes(q.toLowerCase())) continue;
    const prof = MOCK_PROFILE_BY_ID[s.creator_id];
    out.push({
      kind: "signal",
      id: s.id,
      label: `${s.direction} ${s.symbol}`,
      sublabel: prof?.username ? `@${prof.username}` : null,
      symbol: s.symbol,
      href: `/signals/${s.id}`,
    });
  }

  for (const p of Object.values(MOCK_PROFILE_BY_ID)) {
    if (out.length >= limit) break;
    const hay = `${p.username} ${p.full_name ?? ""} ${p.id}`.toLowerCase();
    if (!hay.includes(q.toLowerCase())) continue;
    out.push({
      kind: "creator",
      id: p.id,
      label: p.full_name ?? p.username,
      sublabel: `@${p.username}`,
      symbol: null,
      href: `/channel/${p.id}`,
    });
  }

  for (const t of searchMockTopicCommunityHits(q, 6)) {
    if (out.length >= limit) break;
    out.push({
      kind: "topic",
      id: t.id,
      label: t.title,
      sublabel: t.subtitle,
      symbol: t.linked_symbols[0] ?? null,
      href: t.href,
    });
  }

  for (const r of searchMockCreatorRoomHits(q, 6)) {
    if (out.length >= limit) break;
    out.push({
      kind: "room",
      id: r.room_id,
      label: r.title,
      sublabel: r.subtitle,
      symbol: null,
      href: r.href,
    });
  }

  for (const d of searchMockDiscussionHits(q, 6)) {
    if (out.length >= limit) break;
    out.push({
      kind: "discussion",
      id: d.post_id,
      label: d.title,
      sublabel: `${d.reply_count} yanıt`,
      symbol: d.asset_tag,
      href: d.href,
    });
  }

  return out.slice(0, limit);
}

export function buildComposerPublishSummaryData(input: ComposerPublishSummaryInput): ComposerPublishSummary {
  const lines: string[] = [];
  const warnings: string[] = [];

  const intentLabel = input.intentId
    ? COMPOSER_INTENT_OPTIONS.find((o) => o.id === input.intentId)?.label ?? input.intentId
    : "Genel yayın";
  lines.push(`Niyet: ${intentLabel}`);
  lines.push(`Tür: ${input.contentKind}`);

  if (input.titlePreview?.trim()) lines.push(`Başlık: ${snippet(input.titlePreview, 80)}`);
  if (input.assetTag?.trim()) lines.push(`Varlık: #${input.assetTag.trim().toUpperCase()}`);
  else if (input.intentId === "asset_breakdown") warnings.push("Varlık dökümü için sembol etiketi önerilir.");

  if (input.quotedPostId) lines.push(`Alıntı: gönderi ${input.quotedPostId}`);
  if (input.replyToPostId) lines.push(`Zincir: üst gönderi ${input.replyToPostId}`);
  if (input.quotedSignalId) lines.push(`Sinyal referansı: ${input.quotedSignalId}`);
  if (input.discussionAnchorPostId) lines.push(`Tartışma kökü: ${input.discussionAnchorPostId}`);
  if (input.targetRoomId) {
    lines.push(`Hedef oda: ${input.targetRoomId}`);
    const rid = input.targetRoomId.trim();
    const roomHit = searchMockCreatorRoomHits(rid, 12).find((r) => r.room_id === rid || r.title.toLowerCase().includes(rid.toLowerCase()));
    if (!roomHit) warnings.push("Oda erişimi doğrulanamadı (mock iskelet) — yayın yine de genel akışa gider.");
  }
  if (input.targetTopicSlug) lines.push(`Konu: ${input.targetTopicSlug}`);

  const aud = input.circleAudienceId?.trim();
  if (aud && aud !== "public") {
    lines.push(`Hedef daire: ${aud}`);
    if (aud.includes("inner_strategy") || aud.includes("creator_selected")) {
      lines.push("Erişim: davetli + güvenilir üye katmanı (mock).");
    }
  } else {
    lines.push("Hedef kitle: genel akış");
  }

  if (input.scheduledPublishAt?.trim()) {
    lines.push(`Plan: ${input.scheduledPublishAt}`);
  }

  const c = input.contentPreview.trim();
  if (c) lines.push(`Önizleme: ${snippet(c, 140)}`);
  else warnings.push("İçerik boş — yayın öncesi metin veya medya ekleyin.");

  if (input.intentId === "room_update" && !input.targetRoomId) {
    warnings.push("Oda güncellemesi için hedef oda seçilmedi.");
  }

  return { lines, warnings };
}

const LS_DRAFTS = "marketly-composer-drafts-v1";

function readDrafts(): ComposerDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_DRAFTS);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? (p as ComposerDraft[]) : [];
  } catch {
    return [];
  }
}

function writeDrafts(rows: ComposerDraft[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_DRAFTS, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export function listComposerDraftsData(userId: string): ComposerDraft[] {
  return readDrafts()
    .filter((d) => d.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function saveComposerDraftData(userId: string, payload: ComposerDraftPayload, label?: string): ComposerDraft {
  const rows = readDrafts();
  const id = `draft-${Date.now()}`;
  const draft: ComposerDraft = {
    id,
    userId,
    updatedAt: new Date().toISOString(),
    label: label?.trim() || "Taslak",
    payload,
  };
  const otherUsers = rows.filter((d) => d.userId !== userId);
  const mine = rows.filter((d) => d.userId === userId);
  const nextMine = [draft, ...mine].slice(0, 14);
  writeDrafts([...nextMine, ...otherUsers]);
  return draft;
}

export function deleteComposerDraftData(userId: string, draftId: string): boolean {
  const before = readDrafts();
  const next = before.filter((d) => !(d.userId === userId && d.id === draftId));
  writeDrafts(next);
  return next.length < before.length;
}

export function pickActiveQuotePreview(
  quotedPostId: string | null,
  quotedSignalId: string | null,
  discussionAnchorPostId: string | null,
): ComposerQuotePreview | null {
  if (quotedPostId?.trim()) return buildComposerQuotePreviewForPost(quotedPostId.trim());
  if (quotedSignalId?.trim()) return buildComposerQuotePreviewForSignal(quotedSignalId.trim());
  if (discussionAnchorPostId?.trim()) return buildComposerQuotePreviewForDiscussion(discussionAnchorPostId.trim());
  return null;
}
