"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";

import { useAuth } from "@/features/auth/use-auth";
import type { MediaItem } from "@/features/feed/types";
import { pulseHrefForPostId } from "@/features/pulse/pulse-href";
import { insertUploadPost } from "@/features/upload/insert-upload-post";
import { insertSignal } from "@/features/upload/insert-signal";
import { uploadToBucket } from "@/features/upload/storage-upload";
import {
  UPLOAD_LIMITS,
  loadImageDimensions,
  loadVideoMeta,
  validateImageFile,
  validateVideoFile,
} from "@/features/upload/validate-upload";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { shouldInterceptMockUpload } from "@/mock/adapters/upload";
import { addMockCreatedPost, addMockCreatedSignal } from "@/mock/adapters/upload-store";
import { MOCK_APP_VIEWER_PROFILE_ID } from "@/mock/authentication";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";
import type { ComposerIntentId } from "@/features/social/repository/composer-types";
import { UploadComposerAdvanced } from "@/features/upload/upload-composer-advanced";

type ContentKind = "post" | "signal" | "video" | "pulse" | "live";

const CONTENT_TYPES: { id: ContentKind; label: string; guide: string[] }[] = [
  {
    id: "post",
    label: "Gönderi",
    guide: [
      "Piyasa görüşlerini metin ve görsel ile paylaş",
      "Varlık etiketi ekle — ilgili kanalda görünsün",
      "Yorumlar ve beğenilerle toplulukla etkileş",
      "Görseller 1:1, 4:3 veya 16:9 oranında önerilir",
    ],
  },
  {
    id: "signal",
    label: "Sinyal",
    guide: [
      "Giriş, hedef ve stop seviyeleri net yaz",
      "Tez bölümü gerekçeyi açıklayan kısa analiz olmalı",
      "Konviksiyon seviyesi takipçilerin risk algısını etkiler",
      "Sinyaller otomatik takip edilebilir",
    ],
  },
  {
    id: "video",
    label: "Video",
    guide: [
      "1080p veya 4K tercih edilir",
      "Kapak görseli tıklanma oranını artırır",
      "Başlık 40–60 karakter arası ideal",
      "MP4/H.264 en uyumlu format",
    ],
  },
  {
    id: "pulse",
    label: "Pulse",
    guide: [
      "Dikey format (9:16) tercih edilir",
      `Maksimum ${UPLOAD_LIMITS.shortMaxSeconds} saniye`,
      "Hızlı analiz veya piyasa yorumu için ideal",
      "Keşfet · Pulse sekmesinde öne çıkar",
    ],
  },
  {
    id: "live",
    label: "Canlı",
    guide: [
      "OBS Studio ile RTMP stream",
      "Başlamadan önce ses/görüntü test et",
      "Takipçilere bildirim otomatik gider",
      "Yayın sonrası VOD olarak kaydedilir",
    ],
  },
];

const SIGNAL_DIRECTIONS = ["LONG", "SHORT", "HOLD"] as const;
type SignalDir = typeof SIGNAL_DIRECTIONS[number];
const SIGNAL_TIMEFRAMES = ["Scalp (≤1g)", "Kısa (1h–1h)", "Orta (1h–3ay)", "Uzun (>3ay)"] as const;
const SIGNAL_RISK_LEVELS = ["Düşük", "Orta", "Yüksek"] as const;
type SignalRiskLevel = typeof SIGNAL_RISK_LEVELS[number];
const ASSET_CHIPS = ["BTC", "ETH", "AAPL", "TSLA", "XAU", "USDTRY", "SPX", "THYAO", "GARAN"];
const LIVE_CATEGORIES = ["Piyasa Yorumu", "Trade Seansı", "Eğitim", "Analiz", "Soru-Cevap", "Diğer"];

function uploadPostId(result: { id: string } | { error: string }): string {
  if ("error" in result) throw new Error(result.error);
  return result.id;
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="up-field">
      <label className="up-label">
        {label}
        {required && <span className="up-label-req">*</span>}
      </label>
      {children}
    </div>
  );
}

export function UploadPageClient() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const mockOn = isMockDataEnabled();

  const [kind, setKind] = useState<ContentKind>("post");

  // Shared fields
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [assetTag, setAssetTag] = useState("");

  // Post media
  const [postFiles, setPostFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Video / Pulse
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  // Signal
  const [signalDirection, setSignalDirection] = useState<SignalDir>("LONG");
  const [signalTimeframe, setSignalTimeframe] = useState(SIGNAL_TIMEFRAMES[1]);
  const [signalEntry, setSignalEntry] = useState("");
  const [signalTarget, setSignalTarget] = useState("");
  const [signalStop, setSignalStop] = useState("");
  const [signalConviction, setSignalConviction] = useState(3);
  const [signalRisk, setSignalRisk] = useState<SignalRiskLevel>(SIGNAL_RISK_LEVELS[1]);
  const [signalThesis, setSignalThesis] = useState("");

  // Live
  const [liveCategory, setLiveCategory] = useState(LIVE_CATEGORIES[0]);
  const [liveScheduled, setLiveScheduled] = useState("");

  // Drag
  const [dragOver, setDragOver] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mockSuccess, setMockSuccess] = useState<string | null>(null);

  // Advanced composer (post)
  const [composerIntentId, setComposerIntentId] = useState<ComposerIntentId | null>(null);
  const [quotedPostId, setQuotedPostId] = useState<string | null>(null);
  const [replyToPostId, setReplyToPostId] = useState<string | null>(null);
  const [quotedSignalId, setQuotedSignalId] = useState<string | null>(null);
  const [discussionAnchorPostId, setDiscussionAnchorPostId] = useState<string | null>(null);
  const [targetRoomId, setTargetRoomId] = useState<string | null>(null);
  const [targetTopicSlug, setTargetTopicSlug] = useState<string | null>(null);
  const [scheduledPublishAt, setScheduledPublishAt] = useState("");
  const [circleAudienceId, setCircleAudienceId] = useState("public");

  // Object URLs
  const videoPreviewUrl = useMemo(() => (videoFile ? URL.createObjectURL(videoFile) : null), [videoFile]);
  useEffect(() => () => { if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl); }, [videoPreviewUrl]);

  const postObjectUrls = useMemo(() => postFiles.map((f) => URL.createObjectURL(f)), [postFiles]);
  useEffect(() => () => { postObjectUrls.forEach((u) => URL.revokeObjectURL(u)); }, [postObjectUrls]);

  const thumbPreviewUrl = useMemo(() => (thumbFile ? URL.createObjectURL(thumbFile) : null), [thumbFile]);
  useEffect(() => () => { if (thumbPreviewUrl) URL.revokeObjectURL(thumbPreviewUrl); }, [thumbPreviewUrl]);

  const switchKind = useCallback((k: ContentKind) => {
    setKind(k);
    setVideoFile(null);
    setThumbFile(null);
    setPostFiles([]);
    setError(null);
    setMockSuccess(null);
  }, []);

  const addPostFiles = useCallback((list: FileList | File[]) => {
    setPostFiles((prev) => {
      const next = [...prev];
      for (const f of Array.from(list)) {
        if (next.length >= UPLOAD_LIMITS.postImagesMax) break;
        const err = validateImageFile(f);
        if (err) { setError(err); continue; }
        next.push(f);
      }
      return next;
    });
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      setError(null);
      if (kind === "post") { addPostFiles(e.dataTransfer.files); return; }
      const f = e.dataTransfer.files[0];
      if (!f) return;
      const err = validateVideoFile(f);
      if (err) { setError(err); return; }
      setVideoFile(f);
    },
    [addPostFiles, kind],
  );

  const publish = useCallback(async () => {
    setError(null);
    setMockSuccess(null);

    if (shouldInterceptMockUpload()) {
      setSubmitting(true);
      setProgress("Yayınlanıyor…");
      await new Promise((r) => setTimeout(r, 700));

      const ownerId = uid || MOCK_APP_VIEWER_PROFILE_ID;
      const newId = `mock-created-${Date.now()}`;
      const now = new Date().toISOString();

      if (kind === "signal") {
        if (!assetTag.trim()) { setSubmitting(false); setProgress(""); setError("Varlık etiketi gerekli."); return; }
        const directionMap: Record<SignalDir, "BUY" | "SELL" | "HOLD"> = { LONG: "BUY", SHORT: "SELL", HOLD: "HOLD" };
        addMockCreatedSignal({
          id: newId,
          creator_id: ownerId,
          asset_id: assetTag.trim().toUpperCase(),
          symbol: assetTag.trim().toUpperCase(),
          direction: directionMap[signalDirection],
          confidence: signalConviction * 20,
          entry_price: signalEntry ? parseFloat(signalEntry) : null,
          target_price: signalTarget ? parseFloat(signalTarget) : null,
          stop_loss: signalStop ? parseFloat(signalStop) : null,
          timeframe: signalTimeframe,
          rationale: signalThesis.trim() || content.trim() || null,
          is_active: true,
          copies_count: 0,
          likes_count: 0,
          created_at: now,
          result: null,
          content: signalThesis.trim() || content.trim(),
          asset_tag: assetTag.trim().toUpperCase(),
        });
      } else {
        addMockCreatedPost({
          id: newId,
          user_id: ownerId,
          type: kind === "pulse" ? "pulse" : kind === "video" ? "video" : kind === "live" ? "live" : "post",
          title: title.trim() || null,
          content: content.trim() || title.trim() || ".",
          asset_tag: assetTag.trim().toUpperCase() || null,
          video_url: kind !== "post" ? "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : null,
          thumbnail_url: null,
          image_url: null,
          media_urls: null,
          likes: 0,
          comments: 0,
          views_count: 0,
          shares_count: 0,
          created_at: now,
          quoted_post_id: quotedPostId?.trim() || null,
          reply_to_post_id: replyToPostId?.trim() || null,
          composer_intent_id: composerIntentId,
          quoted_signal_id: quotedSignalId?.trim() || null,
          target_room_id: targetRoomId?.trim() || null,
          target_topic_slug: targetTopicSlug?.trim() || null,
          scheduled_publish_at: scheduledPublishAt.trim() || null,
          discussion_anchor_post_id: discussionAnchorPostId?.trim() || null,
          description: content.trim() || null,
          duration: kind === "pulse" ? 45 : kind === "video" ? 180 : null,
          mentioned_users: null,
          link_preview: null,
        });
      }

      void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
      void qc.invalidateQueries({ queryKey: ["discover-feed"] });
      void qc.invalidateQueries({ queryKey: ["channel-posts", ownerId] });
      void qc.invalidateQueries({ queryKey: ["channel-signals", ownerId] });

      setSubmitting(false);
      setProgress("");
      const typeLabel = CONTENT_TYPES.find((t) => t.id === kind)?.label ?? kind;
      setMockSuccess(`${typeLabel} yayınlandı — profil ve akış sekmelerinde görünür.`);
      return;
    }

    if (!uid) { setError("Oturum bulunamadı."); return; }
    if (!isSupabaseConfigured()) { setError("Supabase yapılandırması eksik."); return; }

    const directionMap: Record<SignalDir, "BUY" | "SELL" | "HOLD"> = { LONG: "BUY", SHORT: "SELL", HOLD: "HOLD" };

    if (kind === "signal") {
      if (!assetTag.trim()) { setError("Varlık etiketi gerekli."); return; }
      if (!signalThesis.trim() && !content.trim()) { setError("Tez/açıklama gerekli."); return; }
      setSubmitting(true);
      setProgress("Sinyal yayınlanıyor…");
      try {
        const client = getSupabaseBrowserClient();
        // BE-REP-002: signals tablosuna doğru INSERT (önceden posts'a yazıyordu)
        const result = await insertSignal(client, {
          userId:      uid,
          assetId:     assetTag.trim().toUpperCase(),
          direction:   directionMap[signalDirection],
          entryPrice:  signalEntry  ? parseFloat(signalEntry)  : null,
          targetPrice: signalTarget ? parseFloat(signalTarget) : null,
          stopLoss:    signalStop   ? parseFloat(signalStop)   : null,
          confidence:  signalConviction * 20,
          timeframe:   signalTimeframe,
          rationale:   signalThesis.trim() || content.trim() || null,
        });
        if ("error" in result) {
          setError(result.error);
        } else {
          router.push(`/signals/${result.id}`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sinyal yayınlanamadı.");
      } finally {
        setSubmitting(false);
        setProgress("");
      }
      return;
    }

    if (kind === "post") {
      if (!content.trim() && postFiles.length === 0) { setError("Metin veya görsel ekleyin."); return; }
      setSubmitting(true);
      setProgress("Görsel yükleniyor…");
      try {
        const client = getSupabaseBrowserClient();
        const mediaItems: MediaItem[] = [];
        for (const f of postFiles) {
          setProgress(`Yükleniyor ${mediaItems.length + 1}/${postFiles.length}…`);
          const dims = await loadImageDimensions(f);
          const { publicUrl } = await uploadToBucket(client, "post-images", uid, f);
          mediaItems.push({ url: publicUrl, width: dims.width, height: dims.height, type: "image" });
        }
        setProgress("Gönderi kaydediliyor…");
        const result = await insertUploadPost(client, {
          userId: uid,
          kind: "post",
          content: content.trim(),
          title: title.trim() || null,
          assetTag: assetTag.trim().toUpperCase() || null,
          mediaUrls: mediaItems,
          quotedPostId: quotedPostId ?? undefined,
          replyToPostId: replyToPostId ?? undefined,
        });
        router.push(`/post/${uploadPostId(result)}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gönderi yayınlanamadı.");
      } finally {
        setSubmitting(false);
        setProgress("");
      }
      return;
    }

    if (kind === "video" || kind === "pulse") {
      if (!videoFile) { setError("Video dosyası gerekli."); return; }
      if (!title.trim()) { setError("Başlık gerekli."); return; }
      setSubmitting(true);
      setProgress("Video yükleniyor…");
      try {
        const client = getSupabaseBrowserClient();
        const meta = await loadVideoMeta(videoFile);
        const { publicUrl: videoUrl } = await uploadToBucket(client, "videos", uid, videoFile);
        let thumbUrl: string | undefined;
        if (thumbFile) {
          setProgress("Kapak yükleniyor…");
          const { publicUrl } = await uploadToBucket(client, "post-images", uid, thumbFile);
          thumbUrl = publicUrl;
        }
        setProgress("İçerik kaydediliyor…");
        const result = await insertUploadPost(client, {
          userId: uid,
          kind: kind === "pulse" ? "short" : "video",
          content: content.trim(),
          title: title.trim(),
          assetTag: assetTag.trim().toUpperCase() || null,
          videoUrl,
          thumbnailUrl: thumbUrl,
          durationSec: meta.duration,
        });
        const id = uploadPostId(result);
        router.push(kind === "pulse" ? pulseHrefForPostId(id) : `/watch/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Video yayınlanamadı.");
      } finally {
        setSubmitting(false);
        setProgress("");
      }
      return;
    }

    if (kind === "live") {
      if (!title.trim()) { setError("Yayın başlığı gerekli."); return; }
      setSubmitting(true);
      setProgress("Yayın başlatılıyor…");
      try {
        const client = getSupabaseBrowserClient();
        const result = await insertUploadPost(client, {
          userId: uid,
          kind: "post",
          content: content.trim() || title.trim(),
          title: title.trim(),
          assetTag: assetTag.trim().toUpperCase() || null,
        });
        uploadPostId(result);
        router.push("/studio/live");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Yayın başlatılamadı.");
      } finally {
        setSubmitting(false);
        setProgress("");
      }
      return;
    }
  }, [
    uid, kind, mockOn, content, title, assetTag,
    signalDirection, signalTimeframe, signalEntry, signalTarget, signalStop,
    signalConviction, signalRisk, signalThesis,
    postFiles, videoFile, thumbFile,
    liveCategory, liveScheduled,
    composerIntentId, quotedPostId, replyToPostId, quotedSignalId,
    discussionAnchorPostId, targetRoomId, targetTopicSlug,
    scheduledPublishAt, circleAudienceId,
    addPostFiles, qc, router,
  ]);

  const displayName = user?.displayName || user?.username || "";
  const initials = displayName.slice(0, 2).toUpperCase() || "CR";
  const currentType = CONTENT_TYPES.find((t) => t.id === kind)!;

  // Not configured / not logged in fallback
  if (!isSupabaseConfigured() && !mockOn) {
    return (
      <div className="up-canvas ms-page-wrapper--no-top" style={{ width: "100%", minWidth: 0 }}>
        <div className="up-page ms-container-wide" style={{ paddingTop: 40 }}>
          <div style={{ padding: "20px 0", borderLeft: "2px solid rgba(239,68,68,0.4)", paddingLeft: 14 }}>
            <p style={{ fontSize: 13, color: "rgba(239,68,68,0.8)", fontWeight: 600 }}>
              Supabase yapılandırılmamış.
            </p>
            <p style={{ fontSize: 12, color: "var(--up-meta)", marginTop: 4 }}>
              Demo modu için <code style={{ fontFamily: "monospace", fontSize: 11 }}>NEXT_PUBLIC_USE_MOCK=true</code> ortam değişkenini ekleyin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="up-canvas ms-page-wrapper--no-top" style={{ width: "100%", minWidth: 0 }}>
      <div className="up-page ms-container-wide">

        {/* Mock notice */}
        {mockOn && (
          <div className="up-notice">
            <span style={{ fontSize: 11, color: "rgba(232,160,32,0.7)", fontWeight: 700, letterSpacing: "0.06em" }}>DEMO</span>
            <span className="up-notice-text">Gerçek veritabanına yazılmaz — tüm akışlar simüle edilir.</span>
          </div>
        )}

        {/* Header */}
        <div className="up-header">
          <div className="up-header-top">
            <div>
              <div className="up-title">İçerik Yayınla</div>
              <div className="up-subtitle">Gönderi, sinyal, video, Pulse veya canlı yayın</div>
            </div>
            {displayName && (
              <div className="up-user-chip">
                <div className="up-user-avatar">{initials}</div>
                <span className="up-user-name">{displayName}</span>
              </div>
            )}
          </div>

          {/* Type bar */}
          <div className="up-type-bar">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchKind(t.id)}
                className={cn("up-type-tab", kind === t.id && "up-type-tab--active")}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="up-grid">

          {/* ── LEFT: form ── */}
          <div className="up-form">

            {/* ── POST FORM ── */}
            {kind === "post" && (
              <>
                <div className="up-section">
                  <UploadComposerAdvanced
                    userId={uid}
                    contentKind={kind}
                    content={content}
                    setContent={setContent}
                    title={title}
                    assetTag={assetTag}
                    setAssetTag={setAssetTag}
                    intentId={composerIntentId}
                    setIntentId={setComposerIntentId}
                    quotedPostId={quotedPostId}
                    setQuotedPostId={setQuotedPostId}
                    replyToPostId={replyToPostId}
                    setReplyToPostId={setReplyToPostId}
                    quotedSignalId={quotedSignalId}
                    setQuotedSignalId={setQuotedSignalId}
                    discussionAnchorPostId={discussionAnchorPostId}
                    setDiscussionAnchorPostId={setDiscussionAnchorPostId}
                    targetRoomId={targetRoomId}
                    setTargetRoomId={setTargetRoomId}
                    targetTopicSlug={targetTopicSlug}
                    setTargetTopicSlug={setTargetTopicSlug}
                    scheduledPublishAt={scheduledPublishAt}
                    setScheduledPublishAt={setScheduledPublishAt}
                    circleAudienceId={circleAudienceId}
                    setCircleAudienceId={setCircleAudienceId}
                  />
                </div>

                <div className="up-section">
                  <Field label="Metin" required>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={7}
                      placeholder="Tezini kur — bağlam, seviye, risk ve senaryo…"
                      className="up-input up-input--area"
                    />
                  </Field>
                </div>

                <div className="up-section">
                  <Field label="Başlık (opsiyonel)">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Opsiyonel başlık"
                      className="up-input"
                    />
                  </Field>
                  <div className="up-field" style={{ marginTop: 18 }}>
                    <label className="up-label">Varlık etiketi</label>
                    <input
                      value={assetTag}
                      onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                      placeholder="ör. BTC"
                      className="up-input up-input--mono"
                      style={{ maxWidth: 160 }}
                    />
                    <div className="up-chip-strip">
                      {ASSET_CHIPS.map((chip) => (
                        <button key={chip} type="button" onClick={() => setAssetTag(chip)}
                          className={cn("up-chip", assetTag === chip && "up-chip--active")}>
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="up-section">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={cn("up-drop-zone", dragOver && "up-drop-zone--over")}
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="up-drop-label">Görselleri sürükle veya seç</div>
                    <div className="up-drop-hint">
                      En fazla {UPLOAD_LIMITS.postImagesMax} görsel · JPEG, PNG, WebP, GIF
                    </div>
                    <button type="button" className="up-drop-btn" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                      Dosya seç
                    </button>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden"
                      onChange={(e) => { if (e.target.files) addPostFiles(e.target.files); e.target.value = ""; }} />
                  </div>

                  {postFiles.length > 0 && (
                    <div className="up-image-grid" style={{ marginTop: 12 }}>
                      {postFiles.map((f, i) => (
                        <div key={`${f.name}-${i}`} className="up-image-thumb">
                          <img src={postObjectUrls[i] ?? ""} alt="" />
                          <button type="button" className="up-image-remove"
                            onClick={() => setPostFiles((p) => p.filter((_, j) => j !== i))}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── SIGNAL FORM ── */}
            {kind === "signal" && (
              <>
                <div className="up-section">
                  <div className="up-section-title">Yön</div>
                  <div className="up-direction-group">
                    {SIGNAL_DIRECTIONS.map((d) => (
                      <button key={d} type="button"
                        onClick={() => setSignalDirection(d)}
                        className={cn(
                          "up-dir-btn",
                          signalDirection === d && d === "LONG"  && "up-dir-btn--long",
                          signalDirection === d && d === "SHORT" && "up-dir-btn--short",
                          signalDirection === d && d === "HOLD"  && "up-dir-btn--hold",
                        )}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="up-section">
                  <Field label="Varlık" required>
                    <input
                      value={assetTag}
                      onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                      placeholder="BTC"
                      className="up-input up-input--mono"
                      style={{ maxWidth: 180 }}
                    />
                    <div className="up-chip-strip">
                      {ASSET_CHIPS.map((chip) => (
                        <button key={chip} type="button" onClick={() => setAssetTag(chip)}
                          className={cn("up-chip", assetTag === chip && "up-chip--active")}>
                          {chip}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="up-section">
                  <div className="up-section-title">Fiyat Seviyeleri</div>
                  <div className="up-price-row">
                    <Field label="Giriş">
                      <input value={signalEntry} onChange={(e) => setSignalEntry(e.target.value)}
                        placeholder="0.00" type="number" step="any"
                        className="up-input up-input--mono" />
                    </Field>
                    <Field label="Hedef">
                      <input value={signalTarget} onChange={(e) => setSignalTarget(e.target.value)}
                        placeholder="0.00" type="number" step="any"
                        className="up-input up-input--mono" />
                    </Field>
                    <Field label="Stop Loss">
                      <input value={signalStop} onChange={(e) => setSignalStop(e.target.value)}
                        placeholder="0.00" type="number" step="any"
                        className="up-input up-input--mono" />
                    </Field>
                  </div>
                </div>

                <div className="up-section">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                    <div>
                      <div className="up-section-title" style={{ marginBottom: 10 }}>Konviksiyon</div>
                      <div className="up-conviction">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button"
                            onClick={() => setSignalConviction(n)}
                            className={cn("up-conv-dot", signalConviction >= n && "up-conv-dot--active")}>
                            {n}
                          </button>
                        ))}
                        <span className="up-conv-label">
                          {signalConviction === 1 ? "Zayıf" : signalConviction === 2 ? "Düşük" : signalConviction === 3 ? "Orta" : signalConviction === 4 ? "Güçlü" : "Çok Güçlü"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="up-section-title" style={{ marginBottom: 10 }}>Risk</div>
                      <div className="up-risk-group">
                        {SIGNAL_RISK_LEVELS.map((r) => (
                          <button key={r} type="button"
                            onClick={() => setSignalRisk(r)}
                            className={cn("up-risk-btn", signalRisk === r && "up-risk-btn--active")}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="up-section">
                  <Field label="Zaman Dilimi">
                    <select value={signalTimeframe}
                      onChange={(e) => setSignalTimeframe(e.target.value as typeof signalTimeframe)}
                      className="up-select" style={{ maxWidth: 240 }}>
                      {SIGNAL_TIMEFRAMES.map((tf) => <option key={tf}>{tf}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="up-section">
                  <Field label="Tez / Analiz" required>
                    <textarea
                      value={signalThesis}
                      onChange={(e) => setSignalThesis(e.target.value)}
                      rows={6}
                      placeholder="Sinyal gerekçesi, teknik veya temel analiz, kritik seviyeler…"
                      className="up-input up-input--area"
                    />
                  </Field>
                </div>
              </>
            )}

            {/* ── VIDEO / PULSE FORM ── */}
            {(kind === "video" || kind === "pulse") && (
              <>
                <div className="up-section">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={cn("up-drop-zone", dragOver && "up-drop-zone--over")}
                  >
                    {videoFile ? (
                      <>
                        <div className="up-drop-file-name">{videoFile.name}</div>
                        <div className="up-drop-file-size">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</div>
                        <button type="button" className="up-drop-remove"
                          onClick={() => { setVideoFile(null); setThumbFile(null); }}>
                          Kaldır
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="up-drop-label">
                          {kind === "pulse" ? "Pulse video sürükle veya seç" : "Video dosyasını sürükle veya seç"}
                        </div>
                        <div className="up-drop-hint">
                          MP4, WebM, MOV · maks. {Math.round(UPLOAD_LIMITS.videoMaxBytes / 1024 / 1024)} MB
                          {kind === "pulse" ? ` · ≤${UPLOAD_LIMITS.shortMaxSeconds} saniye` : ""}
                        </div>
                        <button type="button" className="up-drop-btn" onClick={() => videoRef.current?.click()}>
                          Dosya seç
                        </button>
                      </>
                    )}
                    <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) { const err = validateVideoFile(f); if (err) { setError(err); return; } setError(null); setVideoFile(f); } e.target.value = ""; }} />
                  </div>

                  {videoPreviewUrl && (
                    <video src={videoPreviewUrl} controls className="up-video-preview" playsInline />
                  )}
                </div>

                <div className="up-section">
                  <Field label="Başlık" required>
                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Video başlığı" className="up-input" />
                  </Field>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Açıklama">
                      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
                        placeholder="Video açıklaması…" className="up-input up-input--area" />
                    </Field>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Varlık etiketi">
                      <input value={assetTag} onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                        placeholder="ör. BTC" className="up-input up-input--mono" style={{ maxWidth: 160 }} />
                    </Field>
                  </div>
                </div>

                <div className="up-section">
                  <div className="up-section-title">Kapak Görseli (opsiyonel)</div>
                  <div className="up-thumb-row">
                    {thumbFile && thumbPreviewUrl && (
                      <>
                        <img src={thumbPreviewUrl} alt="" className="up-thumb-preview" />
                        <button type="button" className="up-thumb-remove" onClick={() => setThumbFile(null)}>Kaldır</button>
                      </>
                    )}
                    <button type="button" className="up-thumb-btn" onClick={() => thumbRef.current?.click()}>
                      {thumbFile ? "Değiştir" : "Kapak ekle"}
                    </button>
                  </div>
                  <input ref={thumbRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) { const err = validateImageFile(f); if (err) { setError(err); } else { setError(null); setThumbFile(f); } } e.target.value = ""; }} />
                </div>
              </>
            )}

            {/* ── LIVE FORM ── */}
            {kind === "live" && (
              <>
                <div className="up-section">
                  <div className="up-live-indicator">
                    <span className="up-live-dot" />
                    <span className="up-live-text">Canlı yayın akışı</span>
                  </div>

                  <Field label="Yayın başlığı" required>
                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="ör. Sabah Seans Yorumu — BIST Açılışı" className="up-input" />
                  </Field>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Kategori">
                      <select value={liveCategory} onChange={(e) => setLiveCategory(e.target.value)} className="up-select" style={{ maxWidth: 260 }}>
                        {LIVE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Açıklama">
                      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
                        placeholder="Yayında ne konuşulacak?" className="up-input up-input--area" />
                    </Field>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Varlık etiketi">
                      <input value={assetTag} onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                        placeholder="ör. THYAO" className="up-input up-input--mono" style={{ maxWidth: 160 }} />
                    </Field>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Planlanmış tarih/saat (opsiyonel)">
                      <input type="datetime-local" value={liveScheduled} onChange={(e) => setLiveScheduled(e.target.value)}
                        className="up-input" style={{ maxWidth: 240 }} />
                    </Field>
                  </div>
                </div>

                <div className="up-section">
                  <div className="up-stream-key-box">
                    <div className="up-stream-key-label">Yayın Anahtarı (Stream Key)</div>
                    <div className="up-stream-key-val">
                      {mockOn ? "MOCK-KEY-XXXX-XXXX-XXXX" : "Yayın başlatıldığında oluşturulur"}
                    </div>
                    <div className="up-stream-key-note">
                      OBS Studio veya uyumlu yazılımla RTMP push — WebRTC desteği yakında.
                    </div>
                  </div>
                </div>

                <div className="up-section">
                  <div className="up-section-title">Yayın Öncesi Kontrol</div>
                  <div className="up-checklist">
                    {["Mikrofon çalışıyor", "Kamera/ekran hazır", "Bağlantı stabil", "Konu hazırlandı"].map((item) => (
                      <label key={item} className="up-check-item">
                        <input type="checkbox" />
                        <span className="up-check-label">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Feedback */}
            {error && (
              <div className="up-section">
                <div className="up-error" role="alert" aria-live="assertive">{error}</div>
              </div>
            )}
            {mockSuccess && (
              <div className="up-section">
                <div className="up-success" role="status" aria-live="polite">{mockSuccess}</div>
              </div>
            )}
            {progress && !error && (
              <div className="up-section">
                <div className="up-progress">
                  <span className="up-spinner" />
                  <span>{progress}</span>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT: rail ── */}
          <div className="up-rail">

            {/* İçerik tipi rehberi */}
            <div className="up-guide">
              <div className="up-guide-title">{currentType.label} rehberi</div>
              {currentType.guide.map((item) => (
                <div key={item} className="up-guide-item">
                  <span className="up-guide-item-dot" />
                  <span className="up-guide-item-text">{item}</span>
                </div>
              ))}
            </div>

            {/* Genel ipuçları */}
            <div className="up-guide">
              <div className="up-guide-title">İpuçları</div>
              {[
                "Tutarlı içerik takvimi takipçi sadakati oluşturur",
                "Her içerik için varlık etiketi ekle",
                "Sinyal doğruluk oranın profilinde gösterilir",
                "İlk 48 saatte en yüksek etkileşim alınır",
              ].map((item) => (
                <div key={item} className="up-guide-item">
                  <span className="up-guide-item-dot" />
                  <span className="up-guide-item-text">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="up-cta">
              <button
                type="button"
                disabled={submitting}
                onClick={() => void publish()}
                aria-busy={submitting}
                className="up-publish-btn"
              >
                {submitting ? "Yayınlanıyor…" : kind === "live" ? "Yayını Başlat" : "Yayınla"}
              </button>
              <div className="up-publish-note">
                {mockOn ? "Demo modu — gerçek kayıt yapılmaz." : "Yayınlandıktan sonra akışta görünür."}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
