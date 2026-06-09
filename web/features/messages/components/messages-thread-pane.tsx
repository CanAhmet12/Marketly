"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState, type RefObject } from "react";

import { EmptyState, SkeletonList } from "@/components/states";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { ComposerSuggestion } from "@/features/messages/domain/types";
import {
  conversationKind,
  extConversation,
  MESSAGE_KIND_LABELS,
  peerChannelHref,
} from "@/features/messages/lib/message-conversation-utils";
import type { buildThreadVirtualItems } from "@/features/social/lib/build-thread-virtual-items";
import { formatMessageDayLabel, isSameCalendarDay } from "@/features/social/lib/social-format";
import { getSocialRepository } from "@/features/social/repository";
import type { Conversation, Message } from "@/features/social/repository";
import type { useContainerVirtualListVariable } from "@/hooks/use-virtual-list";
import { cn } from "@/lib/cn";

type ThreadVirtual = ReturnType<typeof useContainerVirtualListVariable>;
type ThreadItems = ReturnType<typeof buildThreadVirtualItems>;

type Props = {
  activeId: string | null;
  activeConv: Conversation | null;
  messages: Message[];
  uid: string;
  hydrated: boolean;
  peerNotFound: string | null;
  messagesBase: string;
  suggestions: ComposerSuggestion[];
  draft: string;
  mockOn: boolean;
  reduceMotion: boolean;
  threadVirtual: ThreadVirtual;
  threadItems: ThreadItems;
  bottomRef: RefObject<HTMLDivElement | null>;
  streamLabel?: string;
  visibleCount?: number;
  onBack: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onSuggestion: (text: string) => void;
};

export function MessagesThreadPane({
  activeId,
  activeConv,
  messages,
  uid,
  hydrated,
  peerNotFound,
  messagesBase,
  suggestions,
  draft,
  mockOn,
  reduceMotion,
  threadVirtual,
  threadItems,
  bottomRef,
  streamLabel = "Tümü",
  visibleCount = 0,
  onBack,
  onDraftChange,
  onSend,
  onSuggestion,
}: Props) {
  const activeExt = activeConv ? extConversation(activeConv) : null;
  const peerHref = uid && activeConv ? peerChannelHref(activeConv, uid) : null;
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const bubblesRef = useRef<HTMLDivElement | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth") => {
      if (threadVirtual.enabled && threadItems.length > 0) {
        threadVirtual.virtualizer.scrollToIndex(threadItems.length - 1, { align: "end", behavior });
        return;
      }
      bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    },
    [bottomRef, reduceMotion, threadItems.length, threadVirtual.enabled, threadVirtual.virtualizer],
  );

  const handleBubblesScroll = useCallback(() => {
    const el = bubblesRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distance > 120);
  }, []);

  useEffect(() => {
    if (!activeId || !hydrated) return;
    const t = window.setTimeout(() => composerRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [activeId, hydrated]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeId) onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, onBack]);

  useEffect(() => {
    handleBubblesScroll();
  }, [messages.length, activeId, handleBubblesScroll]);

  const renderThreadItem = (item: ThreadItems[number]) => {
    if (item.kind === "day") {
      return (
        <div className="msg-day-sep">
          <span className="msg-day-label">{item.label}</span>
        </div>
      );
    }

    const m = item.message;
    const prof = getSocialRepository().getParticipantProfile(m.sender_id);
    const initial = (prof?.full_name ?? prof?.username ?? "?").slice(0, 1);
    const timeStr = new Date(m.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const bubbleContent = (
      <div className={item.mine ? "msg-bubble--mine" : "msg-bubble--theirs"}>
        <p className="msg-bubble-text">{m.content}</p>
        <p className="msg-bubble-time">{timeStr}</p>
      </div>
    );

    return (
      <div className={cn("msg-bubble-row", item.mine ? "msg-bubble-row--mine" : "msg-bubble-row--theirs")}>
        {!item.mine && (
          <div className="msg-avatar-col">
            {item.clusterStart ? (
              prof?.avatar_url ? (
                <SafeAvatar src={prof.avatar_url} alt="" size={28} className="h-7 w-7 rounded-full" />
              ) : (
                <div className="msg-avatar-small">{initial}</div>
              )
            ) : (
              <div aria-hidden style={{ width: 28, height: 28 }} />
            )}
          </div>
        )}
        {reduceMotion ? bubbleContent : <div className="msg-bubble-enter">{bubbleContent}</div>}
      </div>
    );
  };

  const setScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      bubblesRef.current = node;
      const external = threadVirtual.scrollRef as RefObject<HTMLDivElement | null>;
      if (external && "current" in external) {
        (external as { current: HTMLDivElement | null }).current = node;
      }
    },
    [threadVirtual.scrollRef],
  );

  return (
    <section className={cn("msg-thread", !activeId && "hidden min-[800px]:flex")}>
      {!activeId ? (
        <div className="msg-thread-welcome">
          {peerNotFound ? (
            <EmptyState
              title="Henüz sohbet yok"
              description="Bu kullanıcıyla mesaj geçmişiniz bulunmuyor. Kanaldan mesaj göndererek başlayabilirsiniz."
              actionLabel="Kanalı görüntüle"
              actionHref={`/channel/${encodeURIComponent(peerNotFound)}`}
              tone="social"
              compact
            />
          ) : (
            <div className="msg-welcome-inner">
              <div className="msg-welcome-icon" aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="msg-welcome-title">Sohbet seçin</h2>
              <p className="msg-welcome-desc">
                {streamLabel} akışında {visibleCount} konuşma var. Soldan birini seçerek bağlam, geçmiş ve yanıt
                alanını açın.
              </p>
              <p className="msg-welcome-hint">Esc · listeye dön · Enter · gönder</p>
            </div>
          )}
        </div>
      ) : !hydrated ? (
        <div className="msg-bubbles" style={{ padding: "16px 20px" }}>
          <SkeletonList count={4} />
        </div>
      ) : !activeConv ? (
        <div className="msg-thread-empty">
          <EmptyState
            title="Sohbet bulunamadı"
            description="Bu konuşma mevcut değil veya erişiminiz yok."
            actionLabel="Listeye dön"
            onAction={onBack}
            tone="social"
            compact
          />
        </div>
      ) : (
        <>
          <header className="msg-thread-header">
            <div className="msg-thread-title-row">
              <button type="button" className="msg-back-btn" onClick={onBack}>
                ← Liste
              </button>

              <div className="msg-thread-peer">
                {activeConv.avatar_url ? (
                  <SafeAvatar
                    src={activeConv.avatar_url}
                    alt=""
                    size={34}
                    className="h-[34px] w-[34px] shrink-0 rounded-full ring-1 ring-white/10"
                  />
                ) : (
                  <div className="msg-peer-init shrink-0">{activeConv.title.slice(0, 1)}</div>
                )}
                <div className="msg-thread-peer-info">
                  <div className="msg-thread-peer-top">
                    {peerHref ? (
                      <Link href={peerHref} className="msg-peer-name msg-peer-name-link">
                        {activeConv.title}
                      </Link>
                    ) : (
                      <span className="msg-peer-name">{activeConv.title}</span>
                    )}
                    <span className="msg-kind-header-label">{MESSAGE_KIND_LABELS[conversationKind(activeConv)]}</span>
                  </div>
                  <div className="msg-peer-meta">
                    {activeConv.is_group ? "Grup" : "Direkt"}
                    {hydrated && activeConv.online_participant_ids.length ? " · çevrimiçi" : ""}
                    {activeExt?.intel?.trust_label ? ` · ${activeExt.intel.trust_label}` : ""}
                  </div>
                </div>
              </div>

              <div className="msg-thread-actions">
                {peerHref ? (
                  <Link href={peerHref} className="msg-thread-action">
                    Kanal
                  </Link>
                ) : null}
                <Link href={messagesBase} className="msg-thread-action msg-thread-action--desktop">
                  Gelen kutusu
                </Link>
              </div>
            </div>

            {activeExt?.context && (
              <div className="msg-ctx-links">
                {activeExt.context.asset_tag && (
                  <Link href={`/markets/${encodeURIComponent(activeExt.context.asset_tag)}`} className="msg-ctx-link">
                    {activeExt.context.asset_tag}
                  </Link>
                )}
                {activeExt.context.signal_href && (
                  <Link href={activeExt.context.signal_href} className="msg-ctx-link">
                    Sinyal
                  </Link>
                )}
                {activeExt.context.room_href && (
                  <Link href={activeExt.context.room_href} className="msg-ctx-link">
                    Oda
                  </Link>
                )}
                {activeExt.context.discussion_href && (
                  <Link href={activeExt.context.discussion_href} className="msg-ctx-link">
                    Tartışma
                  </Link>
                )}
                {activeExt.context.portfolio_note && (
                  <Link href="/hub/portfolio" className="msg-ctx-link">
                    Portföy
                  </Link>
                )}
              </div>
            )}
          </header>

          <div className="msg-bubbles-wrap">
            <div ref={setScrollRef} className="msg-bubbles" onScroll={handleBubblesScroll}>
              {messages.length === 0 ? (
                <EmptyState
                  title="Mesaj yok"
                  description="Bu sohbette henüz içerik yok. İlk mesajı siz gönderin."
                  tone="social"
                  compact
                />
              ) : threadVirtual.enabled && threadVirtual.virtualItems ? (
                <div style={{ height: threadVirtual.totalSize, position: "relative", width: "100%" }}>
                  {threadVirtual.virtualItems.map((vRow) => {
                    const item = threadItems[vRow.index]!;
                    return (
                      <div
                        key={vRow.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${vRow.start}px)`,
                        }}
                      >
                        {renderThreadItem(item)}
                      </div>
                    );
                  })}
                </div>
              ) : (
                messages.map((m, idx) => {
                  const mine = m.sender_id === uid;
                  const prof = getSocialRepository().getParticipantProfile(m.sender_id);
                  const initial = (prof?.full_name ?? prof?.username ?? "?").slice(0, 1);
                  const prev = messages[idx - 1];
                  const showDay = !prev || !isSameCalendarDay(prev.created_at, m.created_at);
                  const clusterStart = !prev || prev.sender_id !== m.sender_id || showDay;
                  const timeStr = new Date(m.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

                  const bubbleContent = (
                    <div className={mine ? "msg-bubble--mine" : "msg-bubble--theirs"}>
                      <p className="msg-bubble-text">{m.content}</p>
                      <p className="msg-bubble-time">{timeStr}</p>
                    </div>
                  );

                  return (
                    <Fragment key={m.id}>
                      {showDay && (
                        <div className="msg-day-sep">
                          <span className="msg-day-label">{formatMessageDayLabel(m.created_at)}</span>
                        </div>
                      )}
                      <div className={cn("msg-bubble-row", mine ? "msg-bubble-row--mine" : "msg-bubble-row--theirs")}>
                        {!mine && (
                          <div className="msg-avatar-col">
                            {clusterStart ? (
                              prof?.avatar_url ? (
                                <SafeAvatar src={prof.avatar_url} alt="" size={28} className="h-7 w-7 rounded-full" />
                              ) : (
                                <div className="msg-avatar-small">{initial}</div>
                              )
                            ) : (
                              <div aria-hidden style={{ width: 28, height: 28 }} />
                            )}
                          </div>
                        )}
                        {reduceMotion ? bubbleContent : <div className="msg-bubble-enter">{bubbleContent}</div>}
                      </div>
                    </Fragment>
                  );
                })
              )}
              <div ref={bottomRef} aria-hidden style={{ height: 1, width: "100%", flexShrink: 0 }} />
            </div>

            {showScrollDown && messages.length > 0 ? (
              <button
                type="button"
                className="msg-scroll-down"
                aria-label="En alta in"
                onClick={() => scrollToBottom()}
              >
                ↓
              </button>
            ) : null}
          </div>

          <footer className="msg-footer">
            {suggestions.length > 0 && (
              <div className="msg-suggestions">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="msg-suggest-btn"
                    onClick={() => onSuggestion(s.insert_text)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div className="msg-input-row">
              <button
                type="button"
                disabled
                title="Ek (yakında)"
                aria-label="Dosya ekleme yakında"
                className="msg-attach-btn"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>

              <textarea
                ref={composerRef}
                value={draft}
                rows={1}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Bağlamlı yanıt yazın… (Shift+Enter satır)"
                className="msg-input msg-textarea"
              />

              <button type="button" onClick={onSend} disabled={!draft.trim()} className="msg-send-btn">
                Gönder
              </button>
            </div>

            {mockOn && <div className="msg-footer-note">Demo modu — mesajlar tarayıcıda saklanır.</div>}
          </footer>
        </>
      )}
    </section>
  );
}
