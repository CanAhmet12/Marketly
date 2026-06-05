"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { ComposerIntentId, ComposerReferenceHit } from "@/features/social/repository/composer-types";
import { getCloseFriendsRepository } from "@/features/close-friends/repository";
import { getSocialRepository } from "@/features/social/repository";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

const chip =
  "max-w-full shrink-0 truncate rounded-full border px-2.5 py-1 text-[11px] font-semibold transition";
const meta = "text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]";

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
  const [summaryOpen, setSummaryOpen] = useState(true);
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={meta}>Yayın bağlamı</p>
          <p className="mt-1 text-[13px] font-semibold text-[var(--color-text)]">Yayın Bağlamı</p>
          <p className="mt-0.5 text-[12px] text-[var(--color-muted)]">Alıntı, hedef kitle ve referansları yapılandır.</p>
        </div>
        {!mockOn ? (
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(232,160,32,0.65)", padding: "2px 8px", border: "1px solid rgba(232,160,32,0.2)", borderRadius: 4 }}>
            DEMO
          </span>
        ) : null}
      </div>

      <div>
        <p className={meta}>İçerik niyeti</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {intents.map((it) => {
            const on = intentId === it.id;
            return (
              <button
                key={it.id}
                type="button"
                title={it.hint}
                onClick={() => setIntentId(on ? null : it.id)}
                className={cn(
                  chip,
                  on
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-meta)] hover:border-[var(--color-primary)]/40",
                )}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={meta}>Hedef kitle</p>
        <p className="mt-0.5 text-[11px] font-medium text-[var(--color-muted)]">Özel daire veya genel akış — CloseFriends + üyelik modeli</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {audiences.map((a) => {
            const on = circleAudienceId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                disabled={a.locked}
                title={a.sub}
                onClick={() => {
                  if (!a.locked) setCircleAudienceId(a.id);
                }}
                className={cn(
                  chip,
                  a.locked ? "cursor-not-allowed opacity-50" : "",
                  on
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-meta)] hover:border-[var(--color-primary)]/40",
                )}
              >
                {a.label}
              </button>
            );
          })}
        </div>
        {selectedAudience?.href_learn ? (
          <Link href={selectedAudience.href_learn} className="mt-2 inline-block text-[11px] font-semibold text-[var(--color-primary-dark)] hover:underline">
            Daire detayı
          </Link>
        ) : null}
      </div>

      {(quotedPostId || quotedSignalId || discussionAnchorPostId) && (
        <div>
          <p className={meta}>Bağlı önizleme</p>
          {quotePreview ? (
            <div className="mt-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-dark)]">{quotePreview.title}</p>
              <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]">{quotePreview.subtitle}</p>
              <p className="mt-1 line-clamp-3 text-[12px] leading-snug text-[var(--color-text-secondary)]">{quotePreview.snippet}</p>
              <p className="mt-2 text-[11px] text-[var(--color-meta)]">{quotePreview.metaLine}</p>
              <Link href={quotePreview.href} className="mt-2 inline-block text-[12px] font-semibold text-[var(--color-primary-dark)] hover:underline">
                Bağlamı aç
              </Link>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="text-[11px] font-semibold text-[var(--color-danger)] hover:underline"
                  onClick={() => {
                    setQuotedPostId(null);
                    setQuotedSignalId(null);
                    setDiscussionAnchorPostId(null);
                  }}
                >
                  Bağlantıyı kaldır
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[12px] text-[var(--color-muted)]">
              Referans bulunamadı — parametreleri kontrol edin veya arama ile seçin.
            </p>
          )}
        </div>
      )}

      {threadSeed ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <p className={meta}>Zincir</p>
          <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]">{threadSeed.parentAuthorLine}</p>
          <p className="mt-1 line-clamp-2 text-[12px] text-[var(--color-text-secondary)]">{threadSeed.parentSnippet}</p>
          {threadSeed.suggestedPrefix ? (
            <button
              type="button"
              className="mt-2 text-[12px] font-semibold text-[var(--color-primary-dark)] hover:underline"
              onClick={() => setContent(threadSeed.suggestedPrefix + content)}
            >
              Önerilen girişi ekle
            </button>
          ) : null}
        </div>
      ) : null}

      <div>
        <p className={meta}>Referans ara</p>
        <input
          value={refQuery}
          onChange={(e) => setRefQuery(e.target.value)}
          placeholder="Sembol, oda, tartışma, üretici…"
          className="mt-2 w-full max-w-md rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
        {refHits.length > 0 ? (
          <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
            {refHits.map((h) => (
              <li key={`${h.kind}-${h.id}`}>
                <button
                  type="button"
                  onClick={() => applyRef(h)}
                  className="flex w-full flex-col rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-[var(--color-surface-hover)]"
                >
                  <span className="font-semibold text-[var(--color-text)]">
                    <span className="text-[var(--color-meta)]">{h.kind} · </span>
                    {h.label}
                  </span>
                  {h.sublabel ? <span className="text-[11px] text-[var(--color-muted)]">{h.sublabel}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[12px] font-semibold text-[var(--color-text)]">
          Hedef oda ID
          <input
            value={targetRoomId ?? ""}
            onChange={(e) => setTargetRoomId(e.target.value.trim() || null)}
            className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[13px] outline-none focus:border-[var(--color-primary)]"
            placeholder="mock-room-…"
          />
        </label>
        <label className="block text-[12px] font-semibold text-[var(--color-text)]">
          Konu slug / ID
          <input
            value={targetTopicSlug ?? ""}
            onChange={(e) => setTargetTopicSlug(e.target.value.trim() || null)}
            className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[13px] outline-none focus:border-[var(--color-primary)]"
            placeholder="macro-fed"
          />
        </label>
        <label className="block text-[12px] font-semibold text-[var(--color-text)] sm:col-span-2">
          Planlanmış not (yerel)
          <input
            type="datetime-local"
            value={scheduledPublishAt}
            onChange={(e) => setScheduledPublishAt(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[13px] outline-none focus:border-[var(--color-primary)]"
          />
        </label>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setSummaryOpen((s) => !s)}>
          <span className="text-[12px] font-bold text-[var(--color-text)]">Yayın özeti</span>
          <span className="text-[11px] text-[var(--color-meta)]">{summaryOpen ? "Gizle" : "Göster"}</span>
        </button>
        {summaryOpen ? (
          <div className="mt-2 space-y-1.5">
            {publishSummary.lines.map((line, i) => (
              <p key={`${i}-${line.slice(0, 24)}`} className="text-[12px] text-[var(--color-text-secondary)]">
                · {line}
              </p>
            ))}
            {publishSummary.warnings.map((w) => (
              <p key={w} className="text-[12px] font-semibold text-amber-800">
                {w}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-[var(--color-divider)] pt-3">
        <input
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          placeholder="Taslak adı (opsiyonel)"
          className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[12px] outline-none focus:border-[var(--color-primary)] sm:max-w-xs"
        />
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={!userId}
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[12px] font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
        >
          Taslağı kaydet
        </button>
      </div>

      {drafts.length > 0 ? (
        <div>
          <p className={meta}>Taslaklar</p>
          <ul className="mt-2 space-y-1">
            {drafts.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2 text-[12px]">
                <button type="button" className="font-semibold text-[var(--color-primary-dark)] hover:underline" onClick={() => onLoadDraft(d.id)}>
                  {d.label}
                </button>
                <span className="text-[var(--color-meta)]">{new Date(d.updatedAt).toLocaleString()}</span>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-[var(--color-danger)] hover:underline"
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
      ) : (
        <p className="text-[12px] text-[var(--color-muted)]">Kayıtlı taslak yok — mock modda tarayıcıya yazılır.</p>
      )}
    </div>
  );
}
