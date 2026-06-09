"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { HubButtonLink } from "@/features/hub/components/hub-button";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";
import { UploadPublishDock } from "@/features/upload/components/upload-publish-dock";
import { UploadTypeRail, type UploadContentKind } from "@/features/upload/components/upload-type-rail";
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

type ContentKind = UploadContentKind;

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
    <div className="uv2-field">
      <label className="uv2-label">
        {label}
        {required && <span className="uv2-label-req">*</span>}
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

  const pageHeader = (
    <HubPageHeader
      kicker={hubPremiumKicker("tools", "Yayın")}
      title="İçerik Oluştur"
      actions={
        <>
          <HubButtonLink href="/hub/studio/drafts">Taslaklar</HubButtonLink>
          <HubButtonLink href="/hub/studio">Creator Studio</HubButtonLink>
        </>
      }
    />
  );

  const readiness = useMemo(() => {
    if (kind === "post") {
      return [
        { label: "Metin yazıldı", done: content.trim().length > 0 },
        { label: "Varlık etiketi", done: assetTag.trim().length > 0 },
        { label: "Görsel eklendi", done: postFiles.length > 0 },
        { label: "Başlık (opsiyonel)", done: title.trim().length > 0 },
      ];
    }
    if (kind === "signal") {
      return [
        { label: "Varlık seçildi", done: assetTag.trim().length > 0 },
        { label: "Tez yazıldı", done: signalThesis.trim().length > 0 },
        { label: "Fiyat seviyeleri", done: !!(signalEntry || signalTarget || signalStop) },
        { label: "Yön belirlendi", done: !!signalDirection },
      ];
    }
    if (kind === "video" || kind === "pulse") {
      return [
        { label: "Video yüklendi", done: !!videoFile },
        { label: "Başlık yazıldı", done: title.trim().length > 0 },
        { label: "Açıklama", done: content.trim().length > 0 },
        { label: "Kapak görseli", done: !!thumbFile },
      ];
    }
    return [
      { label: "Yayın başlığı", done: title.trim().length > 0 },
      { label: "Kategori", done: !!liveCategory },
      { label: "Açıklama", done: content.trim().length > 0 },
      { label: "Varlık etiketi", done: assetTag.trim().length > 0 },
    ];
  }, [
    kind, content, assetTag, postFiles.length, title,
    signalThesis, signalEntry, signalTarget, signalStop, signalDirection,
    videoFile, thumbFile, liveCategory,
  ]);

  // Not configured / not logged in fallback
  if (!isSupabaseConfigured() && !mockOn) {
    return (
      <HubPageShell zone="tools" className="hp-canvas--embedded-upload" header={pageHeader}>
        <div className="uv2-feedback uv2-feedback--error">
          Supabase yapılandırılmamış. Demo için NEXT_PUBLIC_USE_MOCK=true ekleyin.
        </div>
      </HubPageShell>
    );
  }

  return (
    <HubPageShell zone="tools" className="hp-canvas--embedded-upload" header={pageHeader}>
      <div className="uv2-studio">
        <div className="uv2-page">

          {mockOn && (
            <div className="uv2-demo-banner">
              <span className="uv2-demo-badge">DEMO</span>
              <span>Gerçek veritabanına yazılmaz — akış simüle edilir.</span>
            </div>
          )}

          <UploadTypeRail active={kind} onSelect={switchKind} />

          <div className="uv2-workspace">
            <div className="uv2-main">
              <div className="uv2-panel" data-tone={kind}>

            {/* ── POST FORM ── */}
            {kind === "post" && (
              <>
                <div className="uv2-block">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    placeholder="Fikrini yaz — kısa ve net…"
                    className="uv2-textarea uv2-textarea--hero"
                  />
                </div>

                <div className="uv2-meta-grid">
                  <div className="uv2-meta-card" data-accent="title">
                    <span className="uv2-meta-card-icon" aria-hidden>✦</span>
                    <div className="uv2-meta-card-body">
                      <label className="uv2-meta-card-label">Başlık</label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Opsiyonel — dikkat çekici bir başlık"
                        className="uv2-meta-card-input"
                      />
                    </div>
                  </div>
                  <div className="uv2-meta-card" data-accent="asset">
                    <span className="uv2-meta-card-icon" aria-hidden>◈</span>
                    <div className="uv2-meta-card-body">
                      <label className="uv2-meta-card-label">Varlık etiketi</label>
                      <input
                        value={assetTag}
                        onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                        placeholder="BTC, ETH, THYAO…"
                        className="uv2-meta-card-input uv2-input--mono"
                      />
                      <div className="uv2-chips">
                        {ASSET_CHIPS.map((chip) => (
                          <button key={chip} type="button" onClick={() => setAssetTag(chip)}
                            className={cn("uv2-chip", assetTag === chip && "uv2-chip--active")}>
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="uv2-block uv2-block--media">
                  <div className="uv2-block-head">
                    <span className="uv2-block-stripe" aria-hidden />
                    <p className="uv2-block-title">Görseller</p>
                  </div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={cn("uv2-drop", dragOver && "uv2-drop--over")}
                    onClick={() => fileRef.current?.click()}
                  >
                    <span className="uv2-drop-icon" aria-hidden>+</span>
                    <p className="uv2-drop-title">Sürükle veya seç</p>
                    <p className="uv2-drop-hint">En fazla {UPLOAD_LIMITS.postImagesMax} görsel · JPEG, PNG, WebP</p>
                    <button type="button" className="uv2-drop-btn" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                      Dosya seç
                    </button>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden"
                      onChange={(e) => { if (e.target.files) addPostFiles(e.target.files); e.target.value = ""; }} />
                  </div>

                  {postFiles.length > 0 && (
                    <div className="uv2-thumb-grid">
                      {postFiles.map((f, i) => (
                        <div key={`${f.name}-${i}`} className="uv2-thumb">
                          <img src={postObjectUrls[i] ?? ""} alt="" />
                          <button type="button" className="uv2-thumb-remove"
                            onClick={() => setPostFiles((p) => p.filter((_, j) => j !== i))}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <details className="uv2-advanced uv2-advanced--panel">
                  <summary className="uv2-advanced-summary">
                    <span className="uv2-advanced-summary-left">
                      <span className="uv2-advanced-icon" aria-hidden>⚙</span>
                      Gelişmiş ayarlar
                    </span>
                    <span className="uv2-advanced-hint">Niyet · kitle · referans</span>
                  </summary>
                  <div className="uv2-advanced-body">
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
                </details>
              </>
            )}

            {/* ── SIGNAL FORM ── */}
            {kind === "signal" && (
              <>
                <div className="uv2-block">
                  <div className="uv2-block-title">Yön</div>
                  <div className="uv2-dir-group">
                    {SIGNAL_DIRECTIONS.map((d) => (
                      <button key={d} type="button"
                        onClick={() => setSignalDirection(d)}
                        className={cn(
                          "uv2-dir-btn",
                          signalDirection === d && d === "LONG"  && "uv2-dir-btn--long",
                          signalDirection === d && d === "SHORT" && "uv2-dir-btn--short",
                          signalDirection === d && d === "HOLD"  && "uv2-dir-btn--hold",
                        )}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="uv2-block">
                  <Field label="Varlık" required>
                    <input
                      value={assetTag}
                      onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                      placeholder="BTC"
                      className="uv2-input uv2-input--mono"
                      style={{ maxWidth: 180 }}
                    />
                    <div className="uv2-chips">
                      {ASSET_CHIPS.map((chip) => (
                        <button key={chip} type="button" onClick={() => setAssetTag(chip)}
                          className={cn("uv2-chip", assetTag === chip && "uv2-chip--active")}>
                          {chip}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="uv2-block">
                  <div className="uv2-block-title">Fiyat Seviyeleri</div>
                  <div className="uv2-price-row">
                    <Field label="Giriş">
                      <input value={signalEntry} onChange={(e) => setSignalEntry(e.target.value)}
                        placeholder="0.00" type="number" step="any"
                        className="uv2-input uv2-input--mono" />
                    </Field>
                    <Field label="Hedef">
                      <input value={signalTarget} onChange={(e) => setSignalTarget(e.target.value)}
                        placeholder="0.00" type="number" step="any"
                        className="uv2-input uv2-input--mono" />
                    </Field>
                    <Field label="Stop Loss">
                      <input value={signalStop} onChange={(e) => setSignalStop(e.target.value)}
                        placeholder="0.00" type="number" step="any"
                        className="uv2-input uv2-input--mono" />
                    </Field>
                  </div>
                </div>

                <div className="uv2-block">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                    <div>
                      <div className="uv2-block-title" style={{ marginBottom: 10 }}>Konviksiyon</div>
                      <div className="uv2-conv-row">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button"
                            onClick={() => setSignalConviction(n)}
                            className={cn("uv2-conv-dot", signalConviction >= n && "uv2-conv-dot--active")}>
                            {n}
                          </button>
                        ))}
                        <span style={{ fontSize: 12, color: "var(--color-meta)" }}>
                          {signalConviction === 1 ? "Zayıf" : signalConviction === 2 ? "Düşük" : signalConviction === 3 ? "Orta" : signalConviction === 4 ? "Güçlü" : "Çok Güçlü"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="uv2-block-title" style={{ marginBottom: 10 }}>Risk</div>
                      <div className="uv2-risk-row">
                        {SIGNAL_RISK_LEVELS.map((r) => (
                          <button key={r} type="button"
                            onClick={() => setSignalRisk(r)}
                            className={cn("uv2-risk-btn", signalRisk === r && "uv2-risk-btn--active")}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="uv2-block">
                  <Field label="Zaman Dilimi">
                    <select value={signalTimeframe}
                      onChange={(e) => setSignalTimeframe(e.target.value as typeof signalTimeframe)}
                      className="uv2-select" style={{ maxWidth: 240 }}>
                      {SIGNAL_TIMEFRAMES.map((tf) => <option key={tf}>{tf}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="uv2-block">
                  <Field label="Tez / Analiz" required>
                    <textarea
                      value={signalThesis}
                      onChange={(e) => setSignalThesis(e.target.value)}
                      rows={6}
                      placeholder="Sinyal gerekçesi, teknik veya temel analiz, kritik seviyeler…"
                      className="uv2-textarea"
                    />
                  </Field>
                </div>
              </>
            )}

            {/* ── VIDEO / PULSE FORM ── */}
            {(kind === "video" || kind === "pulse") && (
              <>
                <div className="uv2-block">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={cn("uv2-drop", dragOver && "uv2-drop--over")}
                  >
                    {videoFile ? (
                      <>
                        <p className="uv2-drop-title">{videoFile.name}</p>
                        <p className="uv2-drop-hint">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        <button type="button" className="uv2-drop-btn"
                          onClick={() => { setVideoFile(null); setThumbFile(null); }}>
                          Kaldır
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="uv2-drop-icon" aria-hidden>▶</span>
                        <p className="uv2-drop-title">
                          {kind === "pulse" ? "Pulse video sürükle veya seç" : "Video sürükle veya seç"}
                        </p>
                        <p className="uv2-drop-hint">
                          MP4, WebM, MOV · maks. {Math.round(UPLOAD_LIMITS.videoMaxBytes / 1024 / 1024)} MB
                          {kind === "pulse" ? ` · ≤${UPLOAD_LIMITS.shortMaxSeconds} sn` : ""}
                        </p>
                        <button type="button" className="uv2-drop-btn" onClick={() => videoRef.current?.click()}>
                          Dosya seç
                        </button>
                      </>
                    )}
                    <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) { const err = validateVideoFile(f); if (err) { setError(err); return; } setError(null); setVideoFile(f); } e.target.value = ""; }} />
                  </div>

                  {videoPreviewUrl && (
                    <video src={videoPreviewUrl} controls className="uv2-video-preview" playsInline />
                  )}
                </div>

                <div className="uv2-block">
                  <Field label="Başlık" required>
                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Video başlığı" className="uv2-input" />
                  </Field>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Açıklama">
                      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
                        placeholder="Video açıklaması…" className="uv2-textarea" />
                    </Field>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Varlık etiketi">
                      <input value={assetTag} onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                        placeholder="ör. BTC" className="uv2-input uv2-input--mono" style={{ maxWidth: 160 }} />
                    </Field>
                  </div>
                </div>

                <div className="uv2-block">
                  <div className="uv2-block-title">Kapak Görseli (opsiyonel)</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {thumbFile && thumbPreviewUrl && (
                      <>
                        <img src={thumbPreviewUrl} alt="" className="uv2-thumb" style={{ width: 80, height: 80 }} />
                        <button type="button" className="uv2-drop-btn" onClick={() => setThumbFile(null)}>Kaldır</button>
                      </>
                    )}
                    <button type="button" className="uv2-drop-btn" onClick={() => thumbRef.current?.click()}>
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
                <div className="uv2-block">
                  <div className="uv2-live-badge">
                    <span className="uv2-live-dot" />
                    Canlı yayın
                  </div>

                  <Field label="Yayın başlığı" required>
                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="ör. Sabah Seans Yorumu — BIST Açılışı" className="uv2-input" />
                  </Field>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Kategori">
                      <select value={liveCategory} onChange={(e) => setLiveCategory(e.target.value)} className="uv2-select" style={{ maxWidth: 260 }}>
                        {LIVE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Açıklama">
                      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
                        placeholder="Yayında ne konuşulacak?" className="uv2-textarea" />
                    </Field>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Varlık etiketi">
                      <input value={assetTag} onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                        placeholder="ör. THYAO" className="uv2-input uv2-input--mono" style={{ maxWidth: 160 }} />
                    </Field>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Planlanmış tarih/saat (opsiyonel)">
                      <input type="datetime-local" value={liveScheduled} onChange={(e) => setLiveScheduled(e.target.value)}
                        className="uv2-input" style={{ maxWidth: 240 }} />
                    </Field>
                  </div>
                </div>

                <div className="uv2-block">
                  <div className="uv2-stream-box">
                    <div className="uv2-stream-label">Stream Key</div>
                    <div className="uv2-stream-key">
                      {mockOn ? "MOCK-KEY-XXXX-XXXX-XXXX" : "Yayın başlatıldığında oluşturulur"}
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--color-meta)" }}>
                      OBS veya RTMP uyumlu yazılım
                    </p>
                  </div>
                </div>

                <div className="uv2-block">
                  <div className="uv2-block-title">Yayın Öncesi Kontrol</div>
                  <div className="uv2-checklist">
                    {["Mikrofon çalışıyor", "Kamera/ekran hazır", "Bağlantı stabil", "Konu hazırlandı"].map((item) => (
                      <label key={item} className="uv2-check">
                        <input type="checkbox" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

              </div>
            </div>

            <UploadPublishDock
              kind={kind}
              guide={currentType.guide}
              readiness={readiness}
              displayName={displayName}
              initials={initials}
              assetTag={assetTag}
              submitting={submitting}
              mockOn={mockOn}
              onPublish={() => void publish()}
              error={error}
              progress={progress}
              mockSuccess={mockSuccess}
            />
          </div>

          <div className="uv2-mobile-spacer" aria-hidden />
        </div>
      </div>
    </HubPageShell>
  );
}
