"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { EmptyState } from "@/components/states";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import { useAuth } from "@/features/auth/use-auth";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";
import { togglePostLike, toggleSavedPost } from "@/features/engagement/post-like-save";
import { AgoraVideoStage } from "@/features/live/agora-video-stage";
import { LiveChatRow } from "@/features/live/live-chat-row";
import { LiveWatchDock } from "@/features/live/live-watch-dock";
import { LiveWatchSkeleton } from "@/features/live/live-watch-skeleton";
import { resolveChatRole } from "@/features/live/resolve-chat-role";
import { fetchLiveSessionChannel } from "@/features/live/fetch-live-session";
import { useLiveChat } from "@/features/live/use-live-chat";
import { fetchWatchPost } from "@/features/watch/fetch-watch-post";
import type { WatchPostDetail } from "@/features/watch/types";
import { resolveVideoUrl, posterUrl } from "@/features/watch/watch-helpers";
import { formatCompactCount } from "@/lib/format-compact-count";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { queryKeys } from "@/lib/query-keys";
import { isMockDataEnabled } from "@/mock/config";
import { mockWatchPostDetail } from "@/mock/adapters/watch";
import { isAgoraConfigured } from "@/lib/agora-env";

type Props = { postId: string };

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconVolume({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M16 9l5 5M21 9l-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function formatUptime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LiveWatchClient({ postId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isInitialized } = useAuth();
  const uid = user?.id ?? null;
  const loginNext = `/live/${encodeURIComponent(postId)}`;
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [uptimeSec, setUptimeSec] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const composerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const tick = window.setInterval(() => setUptimeSec((n) => n + 1), 1000);
    return () => window.clearInterval(tick);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, router]);

  const postQuery = useQuery({
    queryKey: queryKeys.watchPost(postId, uid),
    enabled: (isMockDataEnabled() || (isInitialized && isSupabaseConfigured())) && Boolean(postId),
    queryFn: async () => {
      if (isMockDataEnabled()) return mockWatchPostDetail(postId, uid);
      return fetchWatchPost(getSupabaseBrowserClient(), postId, uid);
    },
  });

  const post = postQuery.data;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !post) throw new Error("auth");
      if (isMockDataEnabled()) {
        qc.setQueryData<WatchPostDetail>(queryKeys.watchPost(postId, uid), (old) => {
          if (!old) return old;
          const was = old.is_liked;
          return {
            ...old,
            is_liked: !was,
            likes: Math.max(0, old.likes + (was ? -1 : 1)),
          };
        });
        return;
      }
      const c = getSupabaseBrowserClient();
      await togglePostLike(c, user.id, post.id, post.is_liked);
    },
    onSuccess: () => {
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.watchPost(postId, uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !post) throw new Error("auth");
      if (isMockDataEnabled()) {
        qc.setQueryData<WatchPostDetail>(queryKeys.watchPost(postId, uid), (old) =>
          old ? { ...old, is_saved: !old.is_saved } : old,
        );
        return;
      }
      const c = getSupabaseBrowserClient();
      await toggleSavedPost(c, user.id, post.id, post.is_saved);
    },
    onSuccess: () => {
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.watchPost(postId, uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
    },
  });

  const { messages, scrollRef, scrollToBottom, unseenCount, send } = useLiveChat(postId);

  const onOpenChat = useCallback(() => {
    scrollToBottom();
    composerRef.current?.focus();
  }, [scrollToBottom]);

  const videoSrc = useMemo(() => (post ? resolveVideoUrl(post) : null), [post]);
  const poster = useMemo(() => (post ? posterUrl(post) : null), [post]);

  const sessionQuery = useQuery({
    queryKey: ["live-session", postId] as const,
    enabled: !isMockDataEnabled() && isSupabaseConfigured() && Boolean(postId) && !videoSrc,
    queryFn: async () => fetchLiveSessionChannel(getSupabaseBrowserClient(), postId),
    staleTime: 30_000,
  });

  const agoraChannel = useMemo(() => {
    if (videoSrc || isMockDataEnabled()) return null;
    const fromSession = sessionQuery.data?.channel_name?.trim();
    return fromSession || postId;
  }, [videoSrc, sessionQuery.data, postId]);

  const viewerCount = sessionQuery.data?.viewer_count ?? post?.views_count ?? 0;
  const streamTitle = post?.title?.trim() || post?.content?.slice(0, 80) || "Canlı yayın";

  const renderPortal = (node: ReactNode) => {
    if (!mounted) return null;
    return createPortal(node, document.body);
  };

  const handleSend = async () => {
    if (!draft.trim()) return;
    if (!user) {
      router.push(`/auth/login?next=/live/${encodeURIComponent(postId)}`);
      return;
    }
    setSending(true);
    setSendError(null);
    const res = await send(draft);
    setSending(false);
    if (!res.ok) {
      setSendError("error" in res ? res.error ?? "Mesaj gönderilemedi" : "Mesaj gönderilemedi");
      return;
    }
    setDraft("");
    scrollToBottom();
  };

  if ((!isInitialized && !isMockDataEnabled()) || postQuery.isPending) {
    return renderPortal(<LiveWatchSkeleton />);
  }

  if (postQuery.isError) {
    return renderPortal(
      <div className="live-watch live-watch--empty">
        <EmptyState
          title="Canlı yayın yüklenemedi"
          description="Bağlantını kontrol edip tekrar dene."
          actionLabel="Tekrar dene"
          onAction={() => void postQuery.refetch()}
          secondaryActionLabel="Canlı keşfet"
          secondaryActionHref="/live"
          compact
        />
      </div>,
    );
  }

  if (!post) {
    return renderPortal(
      <div className="live-watch live-watch--empty">
        <EmptyState title="Canlı yayın bulunamadı" actionLabel="Canlı keşfet" actionHref="/live" compact />
      </div>,
    );
  }

  return renderPortal(
    <div className="live-watch" role="main" aria-label="Canlı yayın">
      <div className="live-watch__ambient" aria-hidden />

      <header className="live-watch__toolbar">
        <button type="button" className="live-watch__back" onClick={() => router.back()} aria-label="Geri">
          <IconBack />
        </button>

        <span className="live-watch__live-badge" role="status">
          <span className="live-watch__live-dot" aria-hidden />
          CANLI
        </span>

        <Link href={`/channel/${post.user_id}`} className="live-watch__host">
          <SafeAvatar
            src={post.author_avatar ?? fallbackAvatar(post.user_id, post.author_name)}
            alt=""
            size={28}
            className="live-watch__host-avatar"
          />
          <span className="live-watch__host-name">{post.author_name}</span>
        </Link>

        <p className="live-watch__toolbar-meta" key={viewerCount}>
          <IconUsers />
          <span>{formatCompactCount(viewerCount)}</span>
          <span className="live-watch__toolbar-sep" aria-hidden>
            ·
          </span>
          <span>{formatUptime(uptimeSec)}</span>
        </p>

        <Link href={`/channel/${post.user_id}`} className="live-watch__follow-btn">
          Kanalı gör
        </Link>
      </header>

      <div className="live-watch__cinema">
        <div className="live-watch__primary">
          <div className="live-watch__stage">
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" className="live-watch__stage-blur" aria-hidden />
            ) : null}

            {videoSrc ? (
              <video
                ref={videoRef}
                className="live-watch__video"
                src={videoSrc}
                poster={poster ?? undefined}
                playsInline
                autoPlay
                muted={videoMuted}
              />
            ) : agoraChannel && isAgoraConfigured() ? (
              <AgoraVideoStage channelName={agoraChannel} poster={poster} />
            ) : (
              <div className="live-watch__placeholder">
                <span className="live-watch__placeholder-dot" aria-hidden />
                <p className="live-watch__placeholder-title">Yayın bekleniyor</p>
                <p className="live-watch__placeholder-sub">
                  {isAgoraConfigured()
                    ? "Yayıncı bağlanınca akış burada başlayacak."
                    : "Canlı video için Agora yapılandırması gerekli."}
                </p>
              </div>
            )}

            {videoSrc && videoMuted ? (
              <button
                type="button"
                className="live-watch__unmute"
                aria-label="Sesi aç"
                onClick={() => {
                  setVideoMuted(false);
                  const el = videoRef.current;
                  if (el) {
                    el.muted = false;
                    void el.play().catch(() => undefined);
                  }
                }}
              >
                <IconVolume muted />
                Sesi aç
              </button>
            ) : null}
          </div>

          <LiveWatchDock
            post={post}
            streamTitle={streamTitle}
            viewerCount={viewerCount}
            userId={uid}
            loginNext={loginNext}
            likeMutation={likeMutation}
            saveMutation={saveMutation}
            onOpenChat={onOpenChat}
          />
        </div>

        <aside className="live-watch__chat" aria-label="Canlı sohbet">
          <header className="live-watch__chat-head">
            <p className="live-watch__chat-title">
              <span className="live-watch__chat-live-dot" aria-hidden />
              Canlı sohbet
              <span className="live-watch__chat-meta">
                · {formatCompactCount(messages.length)} mesaj
              </span>
            </p>
            <div className="live-watch__chat-stats">
              <IconUsers />
              <span>{formatCompactCount(viewerCount)}</span>
            </div>
          </header>

          <div className="live-watch__chat-body">
            <div ref={scrollRef} className="live-watch__chat-feed" aria-live="polite">
              {messages.length === 0 ? (
                <p className="live-watch__chat-empty">Henüz mesaj yok — ilk sen yaz.</p>
              ) : (
                messages.map((m, idx) => (
                  <LiveChatRow
                    key={m.id}
                    username={m.username}
                    content={m.content}
                    avatarUrl={m.avatar_url}
                    isGift={m.is_gift}
                    giftIcon={m.gift_icon}
                    role={resolveChatRole(m.username, m.user_id, post.user_id)}
                    isFresh={idx === messages.length - 1}
                  />
                ))
              )}
            </div>

            {unseenCount > 0 ? (
              <button type="button" className="live-watch__chat-jump" onClick={scrollToBottom}>
                {unseenCount} yeni mesaj ↓
              </button>
            ) : null}
          </div>

          <form
            className="live-watch__composer"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
          >
            <input
              ref={composerRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={user ? "Canlı yayına mesaj gönder…" : "Sohbet için giriş yap"}
              className="live-watch__input"
              maxLength={280}
              disabled={sending}
            />
            <button
              type="submit"
              className="live-watch__send"
              disabled={sending || !draft.trim()}
              aria-label="Gönder"
            >
              <IconSend />
            </button>
          </form>
          {sendError ? <p className="live-watch__error">{sendError}</p> : null}
        </aside>
      </div>
    </div>,
  );
}
