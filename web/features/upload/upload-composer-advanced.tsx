"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { ComposerIntentId, ComposerReferenceHit } from "@/features/social/repository/composer-types";
import { getCloseFriendsRepository } from "@/features/close-friends/repository";
import { getSocialRepository } from "@/features/social/repository";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

type ContentKind = "post" | "signal" | "video" | "pulse" | "live";

export type UploadComposerAdvancedProps = {
  userId: string;
  contentKind: ContentKind;
  content: string;
  setContent: (v: string) => void;
  title: string;
  assetTag: string;
  setAssetTag: (v: string) => void;
  intentId: ComposerIntentId | null;
  setIntentId: (v: ComposerIntentId | null) => void;
  quotedPostId: string | null;
  setQuotedPostId: (v: string | null) => void;
  replyToPostId: string | null;
  setReplyToPostId: (v: string | null) => void;
  quotedSignalId: string | null;
  setQuotedSignalId: (v: string | null) => void;
  discussionAnchorPostId: string | null;
  setDiscussionAnchorPostId: (v: string | null) => void;
  targetRoomId: string | null;
  setTargetRoomId: (v: string | null) => void;
  targetTopicSlug: string | null;
  setTargetTopicSlug: (v: string | null) => void;
  scheduledPublishAt: string;
  setScheduledPublishAt: (v: string) => void;
  circleAudienceId: string;
  setCircleAudienceId: (v: string) => void;
};

function parseIntent(raw: string | null): ComposerIntentId | null {
  if (!raw) return null;
  const opts = getSocialRepository().getComposerIntentOptions();
  return opts.some((o) => o.id === raw) ? (raw as ComposerIntentId) : null;
}

export function UploadComposerAdvanced({
  userId,
  contentKind,
  content,
  setContent,
  title,
  assetTag,
  setAssetTag,
  intentId,
  setIntentId,
  quotedPostId,
  setQuotedPostId,
  replyToPostId,
  setReplyToPostId,
  quotedSignalId,
  setQuotedSignalId,
  discussionAnchorPostId,
  setDiscussionAnchorPostId,
  targetRoomId,
  setTargetRoomId,
  targetTopicSlug,
  setTargetTopicSlug,
  scheduledPublishAt,
  setScheduledPublishAt,
  circleAudienceId,
  setCircleAudienceId,
}: UploadComposerAdvancedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repo = useMemo(() => getSocialRepository(), []);
  const mockOn = isMockDataEnabled();
  const [refQuery, setRefQuery] = useState("");
  const audiences = useMemo(
    () => (userId ? getCloseFriendsRepository().getComposerCircleAudiences(userId) : []),
    [userId],
  );
  const [refHits, setRefHits] = useState<ComposerReferenceHit[]>([]);
  const [draftNote, setDraftNote] = useState("");
  const [draftTick, setDraftTick] = useState(0);

  useEffect(() => {
    const qp = searchParams.get("quotePost");
    const qs = searchParams.get("quoteSignal");
    const qd = searchParams.get("quoteDiscussion");
    const rt = searchParams.get("replyThread");
    const room = searchParams.get("room");
    const topic = searchParams.get("topic");
    const asset = searchParams.get("asset");
    const intent = searchParams.get("intent");
    if (qp) setQuotedPostId(qp);
    if (qs) setQuotedSignalId(qs);
    if (qd) setDiscussionAnchorPostId(qd);
    if (rt) setReplyToPostId(rt);
    if (room) setTargetRoomId(room);
    if (topic) setTargetTopicSlug(topic);
    if (asset) setAssetTag(asset.toUpperCase());
    const parsed = parseIntent(intent);
    if (parsed) setIntentId(parsed);
  }, [searchParams, setAssetTag, setDiscussionAnchorPostId, setIntentId, setQuotedPostId, setQuotedSignalId, setReplyToPostId, setTargetRoomId, setTargetTopicSlug]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setRefHits(repo.searchComposerReferences(refQuery, 12));
    }, 260);
    return () => window.clearTimeout(t);
  }, [refQuery, repo]);

  const intents = useMemo(() => repo.getComposerIntentOptions(), [repo]);

  const quotePreview = useMemo(
    () =>
      repo.getComposerQuotePreview({
        quotedPostId,
        quotedSignalId,
        discussionAnchorPostId,
      }),
    [repo, quotedPostId, quotedSignalId, discussionAnchorPostId],
  );

  const threadSeed = useMemo(() => repo.getComposerThreadContinuationSeed(replyToPostId), [repo, replyToPostId]);

  const drafts = useMemo(() => {
    void draftTick;
    return userId ? repo.listComposerDrafts(userId) : [];
  }, [repo, userId, draftTick]);

  const publishSummary = useMemo(
    () =>
      repo.buildComposerPublishSummary({
        intentId,
        contentKind,
        assetTag: assetTag.trim() || null,
        quotedPostId,
        replyToPostId,
        quotedSignalId,
        discussionAnchorPostId,
        targetRoomId,
        targetTopicSlug,
        circleAudienceId: circleAudienceId === "public" ? undefined : circleAudienceId,
        scheduledPublishAt: scheduledPublishAt || null,
        contentPreview: content,
        titlePreview: title.trim() || null,
      }),
    [
      repo,
      intentId,
      contentKind,
      assetTag,
      quotedPostId,
      replyToPostId,
      quotedSignalId,
      discussionAnchorPostId,
      targetRoomId,
      targetTopicSlug,
      scheduledPublishAt,
      circleAudienceId,
      content,
      title,
    ],
  );

  const applyRef = useCallback(
    (h: (typeof refHits)[0]) => {
      if (h.kind === "asset" && h.symbol) setAssetTag(h.symbol);
      if (h.kind === "room") setTargetRoomId(h.id);
      if (h.kind === "topic") setTargetTopicSlug(h.id);
      if (h.kind === "signal") setQuotedSignalId(h.id);
      if (h.kind === "discussion") setDiscussionAnchorPostId(h.id);
      if (h.kind === "creator") {
        void router.push(`/upload?intent=creator_note`);
        setIntentId("creator_note");
      }
      setRefQuery("");
    },
    [router, setAssetTag, setDiscussionAnchorPostId, setIntentId, setQuotedSignalId, setTargetRoomId, setTargetTopicSlug],
  );

  const onSaveDraft = useCallback(() => {
    if (!userId) return;
    repo.saveComposerDraft(
      userId,
      {
        contentKind,
        content,
        title,
        assetTag,
        intentId,
        quotedPostId,
        replyToPostId,
        quotedSignalId,
        discussionAnchorPostId,
        targetRoomId,
        targetTopicSlug,
        scheduledPublishAt: scheduledPublishAt || null,
        circleAudienceId: circleAudienceId === "public" ? undefined : circleAudienceId,
      },
      draftNote || undefined,
    );
    setDraftNote("");
    setDraftTick((x) => x + 1);
  }, [
    userId,
    repo,
    contentKind,
    content,
    title,
    assetTag,
    intentId,
    quotedPostId,
    replyToPostId,
    quotedSignalId,
    discussionAnchorPostId,
    targetRoomId,
    targetTopicSlug,
    scheduledPublishAt,
    circleAudienceId,
    draftNote,
  ]);

  const onLoadDraft = useCallback(
    (id: string) => {
      const d = drafts.find((x) => x.id === id);
      if (!d) return;
      const p = d.payload;
      setContent(p.content);
      if (p.assetTag) setAssetTag(p.assetTag);
      setIntentId(p.intentId);
      setQuotedPostId(p.quotedPostId);
      setReplyToPostId(p.replyToPostId);
      setQuotedSignalId(p.quotedSignalId);
      setDiscussionAnchorPostId(p.discussionAnchorPostId);
      setTargetRoomId(p.targetRoomId);
      setTargetTopicSlug(p.targetTopicSlug);
      setScheduledPublishAt(p.scheduledPublishAt ?? "");
      setCircleAudienceId(!p.circleAudienceId || p.circleAudienceId === "public" ? "public" : p.circleAudienceId);
    },
    [
      drafts,
      setContent,
      setAssetTag,
      setIntentId,
      setQuotedPostId,
      setReplyToPostId,
      setQuotedSignalId,
      setDiscussionAnchorPostId,
      setTargetRoomId,
      setTargetTopicSlug,
      setScheduledPublishAt,
      setCircleAudienceId,
    ],
  );

  const selectedAudience = useMemo(() => audiences.find((a) => a.id === circleAudienceId), [audiences, circleAudienceId]);

  if (contentKind !== "post") return null;

  return (
    <div className="uv2-composer">
      {mockOn ? (
        <div className="uv2-demo-banner" style={{ marginBottom: 4 }}>
          <span className="uv2-demo-badge">DEMO</span>
          <span>Taslaklar tarayıcıda saklanır.</span>
        </div>
      ) : null}

      <div className="uv2-composer-section">
        <p className="uv2-block-title">Niyet</p>
        <div className="uv2-chips">
          {intents.map((it) => {
            const on = intentId === it.id;
            return (
              <button
                key={it.id}
                type="button"
                title={it.hint}
                onClick={() => setIntentId(on ? null : it.id)}
                className={cn("uv2-chip", on && "uv2-chip--active")}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="uv2-composer-section">
        <p className="uv2-block-title">Kitle</p>
        <div className="uv2-chips">
          {audiences.map((a) => {
            const on = circleAudienceId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                disabled={a.locked}
                title={a.sub}
                onClick={() => { if (!a.locked) setCircleAudienceId(a.id); }}
                className={cn("uv2-chip", a.locked && "opacity-50 cursor-not-allowed", on && "uv2-chip--active")}
              >
                {a.label}
              </button>
            );
          })}
        </div>
        {selectedAudience?.href_learn ? (
          <Link href={selectedAudience.href_learn} className="uv2-composer-link">
            Daire detayı →
          </Link>
        ) : null}
      </div>

      {(quotedPostId || quotedSignalId || discussionAnchorPostId) && (
        <div className="uv2-composer-section">
          <p className="uv2-block-title">Bağlı içerik</p>
          {quotePreview ? (
            <div className="uv2-composer-preview">
              <p className="uv2-composer-preview-title">{quotePreview.title}</p>
              <p style={{ marginTop: 4, fontSize: 13, fontFamily: "var(--font-bold)" }}>{quotePreview.subtitle}</p>
              <p className="uv2-composer-preview-body">{quotePreview.snippet}</p>
              <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
                <Link href={quotePreview.href} className="uv2-composer-link">Aç</Link>
                <button
                  type="button"
                  className="uv2-composer-danger"
                  onClick={() => {
                    setQuotedPostId(null);
                    setQuotedSignalId(null);
                    setDiscussionAnchorPostId(null);
                  }}
                >
                  Kaldır
                </button>
              </div>
            </div>
          ) : (
            <p className="uv2-composer-preview-body">Referans bulunamadı.</p>
          )}
        </div>
      )}

      {threadSeed ? (
        <div className="uv2-composer-preview">
          <p className="uv2-block-title">Zincir yanıtı</p>
          <p style={{ marginTop: 6, fontSize: 12, fontFamily: "var(--font-bold)" }}>{threadSeed.parentAuthorLine}</p>
          <p className="uv2-composer-preview-body">{threadSeed.parentSnippet}</p>
          {threadSeed.suggestedPrefix ? (
            <button
              type="button"
              className="uv2-composer-link"
              style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onClick={() => setContent(threadSeed.suggestedPrefix + content)}
            >
              Önerilen girişi ekle →
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="uv2-composer-section">
        <p className="uv2-block-title">Referans ara</p>
        <input
          value={refQuery}
          onChange={(e) => setRefQuery(e.target.value)}
          placeholder="Sembol, oda, tartışma…"
          className="uv2-input"
        />
        {refHits.length > 0 ? (
          <div className="uv2-composer-ref-list">
            {refHits.map((h) => (
              <button key={`${h.kind}-${h.id}`} type="button" onClick={() => applyRef(h)} className="uv2-composer-ref-item">
                <span style={{ fontFamily: "var(--font-bold)" }}>
                  <span style={{ color: "var(--color-meta)" }}>{h.kind} · </span>
                  {h.label}
                </span>
                {h.sublabel ? <span style={{ fontSize: 11, color: "var(--color-meta)" }}>{h.sublabel}</span> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="uv2-composer-grid">
        <div className="uv2-field">
          <label className="uv2-label">Hedef oda</label>
          <input
            value={targetRoomId ?? ""}
            onChange={(e) => setTargetRoomId(e.target.value.trim() || null)}
            className="uv2-input"
            placeholder="mock-room-…"
          />
        </div>
        <div className="uv2-field">
          <label className="uv2-label">Konu slug</label>
          <input
            value={targetTopicSlug ?? ""}
            onChange={(e) => setTargetTopicSlug(e.target.value.trim() || null)}
            className="uv2-input"
            placeholder="macro-fed"
          />
        </div>
        <div className="uv2-field" style={{ gridColumn: "1 / -1" }}>
          <label className="uv2-label">Planlı yayın</label>
          <input
            type="datetime-local"
            value={scheduledPublishAt}
            onChange={(e) => setScheduledPublishAt(e.target.value)}
            className="uv2-input"
            style={{ maxWidth: 280 }}
          />
        </div>
      </div>

      <details className="uv2-advanced">
        <summary className="uv2-advanced-summary">
          Yayın özeti
          <span className="uv2-advanced-hint">{publishSummary.lines.length} satır</span>
        </summary>
        <div className="uv2-advanced-body">
          {publishSummary.lines.map((line, i) => (
            <p key={`${i}-${line.slice(0, 24)}`} className="uv2-composer-preview-body">· {line}</p>
          ))}
          {publishSummary.warnings.map((w) => (
            <p key={w} style={{ fontSize: 12, color: "#b45309", marginTop: 6 }}>{w}</p>
          ))}
        </div>
      </details>

      <div className="uv2-composer-draft-row">
        <input
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          placeholder="Taslak adı"
          className="uv2-input"
          style={{ flex: "1 1 160px", maxWidth: 240 }}
        />
        <button type="button" onClick={onSaveDraft} disabled={!userId} className="uv2-drop-btn">
          Taslağı kaydet
        </button>
      </div>

      {drafts.length > 0 ? (
        <div className="uv2-composer-section">
          <p className="uv2-block-title">Taslaklar</p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {drafts.map((d) => (
              <li key={d.id} style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12, alignItems: "center" }}>
                <button type="button" className="uv2-composer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={() => onLoadDraft(d.id)}>
                  {d.label}
                </button>
                <span style={{ color: "var(--color-meta)" }}>{new Date(d.updatedAt).toLocaleString()}</span>
                <button
                  type="button"
                  className="uv2-composer-danger"
                  onClick={() => {
                    if (!userId) return;
                    repo.deleteComposerDraft(userId, d.id);
                    setDraftTick((x) => x + 1);
                  }}
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
