"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { EmptyState, SkeletonList } from "@/components/states";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import { useAuth } from "@/features/auth/use-auth";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";
import { buildThreadVirtualItems, type ThreadVirtualItem } from "@/features/social/lib/build-thread-virtual-items";
import {
  MESSAGES_INBOX_ITEM_ESTIMATE,
  MESSAGES_THREAD_BUBBLE_ESTIMATE,
  MESSAGES_THREAD_DAY_ESTIMATE,
  useContainerVirtualList,
  useContainerVirtualListVariable,
} from "@/hooks/use-virtual-list";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { MessageInboxStreamId } from "@/features/messages/domain/types";
import { useMessageCenter } from "@/features/messages/hooks/use-message-center";
import {
  MESSAGES_INBOX_PATH,
  messagesConversationPath,
  resolveMessagesBase,
} from "@/features/messages/routes";
import { MessagesPageSkeleton } from "@/features/social/components/social-states";
import { useMessageInbox } from "@/features/social/hooks/use-message-inbox";
import { formatMessageDayLabel, formatSocialRelativeTime, isSameCalendarDay } from "@/features/social/lib/social-format";
import { messageStreamToParam, resolveMessageStream } from "@/features/social/lib/inbox-stream-params";
import { findConversationWithPeer } from "@/features/social/lib/resolve-peer-conversation";
import { getSocialRepository } from "@/features/social/repository";
import type { Conversation } from "@/features/social/repository";
import type { MockConversationKind, MockConversationRow } from "@/features/social/types";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

type Props = { conversationId?: string | null };

const STREAMS: { id: MessageInboxStreamId; label: string }[] = [
  { id: "important",   label: "Önemli" },
  { id: "creators",    label: "Creator'lar" },
  { id: "premium",     label: "Premium" },
  { id: "rooms",       label: "Odalar" },
  { id: "markets",     label: "Piyasalar" },
  { id: "discussions", label: "Tartışmalar" },
  { id: "close",       label: "Yakın çevre" },
  { id: "all",         label: "Tümü" },
];

const KIND_LABELS: Record<MockConversationKind, string> = {
  creator_dm:     "DM",
  circle_private: "Daire",
  premium_member: "Premium",
  signal_thread:  "Sinyal",
  support:        "Destek",
  market_debate:  "Tartışma",
  room_side:      "Oda",
  strategy:       "Strateji",
  event_temp:     "Etkinlik",
  live_watch:     "Canlı",
};

function ext(c: Conversation): MockConversationRow { return c as unknown as MockConversationRow; }
function peerChannelHref(c: Conversation, selfId: string): string | null {
  if (c.is_group) return null;
  const other = c.participant_ids.find((p) => p !== selfId);
  return other ? `/channel/${encodeURIComponent(other)}` : null;
}
function kindOf(c: Conversation): MockConversationKind {
  return ext(c).kind ?? (c.is_group ? "market_debate" : "creator_dm");
}

export function MessagesPageClient({ conversationId: initialConvId = null }: Props) {
  const mockOn      = isMockDataEnabled();
  const reduceMotion = usePrefersReducedMotion();
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uid    = user?.id ?? "";
  const streamTabRefs = useRef<Partial<Record<MessageInboxStreamId, HTMLButtonElement | null>>>({});

  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ]               = useState("");
  const [draft, setDraft]       = useState("");
  const [peerNotFound, setPeerNotFound] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const peerHandledRef = useRef(false);

  const peerParam = searchParams.get("peer")?.trim() || null;

  const stream = useMemo(() => resolveMessageStream(searchParams.get("stream")), [searchParams]);

  const messagesBase = useMemo(() => resolveMessagesBase(pathname ?? ""), [pathname]);

  const pushStream = useCallback(
    (id: MessageInboxStreamId) => {
      const sp = new URLSearchParams(searchParams.toString());
      const param = messageStreamToParam(id);
      if (param) sp.set("stream", param);
      else sp.delete("stream");
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const activeId = initialConvId ?? selected;
  const { conversations, messages, send, hydrated, version } = useMessageInbox(user?.id, activeId);
  const { hub, suggestions } = useMessageCenter(user?.id, activeId, version);

  const onStreamKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, current: MessageInboxStreamId) => {
      const order = STREAMS.map((s) => s.id);
      const idx = order.indexOf(current);
      if (idx < 0) return;
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % order.length;
      else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + order.length) % order.length;
      else return;
      e.preventDefault();
      const next = order[nextIdx]!;
      streamTabRefs.current[next]?.focus();
      pushStream(next);
    },
    [pushStream],
  );

  const visibleItems = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let items = hub.items;
    if (stream !== "all") items = items.filter((i) => i.streams.includes(stream));
    if (qq) {
      items = items.filter(
        (i) =>
          i.row.title.toLowerCase().includes(qq) ||
          (i.row.subtitle ?? "").toLowerCase().includes(qq) ||
          i.row.last_message.content.toLowerCase().includes(qq),
      );
    }
    return items;
  }, [hub.items, stream, q]);

  const inboxVirtual = useContainerVirtualList({
    count: visibleItems.length,
    itemHeight: MESSAGES_INBOX_ITEM_ESTIMATE,
  });

  const threadItems = useMemo(() => buildThreadVirtualItems(messages, uid), [messages, uid]);

  const threadVirtual = useContainerVirtualListVariable({
    count: threadItems.length,
    estimateSize: (index) =>
      threadItems[index]?.kind === "day" ? MESSAGES_THREAD_DAY_ESTIMATE : MESSAGES_THREAD_BUBBLE_ESTIMATE,
  });

  const activeConv = useMemo(() => conversations.find((x) => x.id === activeId) ?? null, [conversations, activeId]);
  const peerHref   = uid && activeConv ? peerChannelHref(activeConv, uid) : null;
  const activeExt  = activeConv ? ext(activeConv) : null;

  const select = useCallback(
    (id: string) => {
      setSelected(id);
      router.push(messagesConversationPath(id));
    },
    [router],
  );

  const onSend = useCallback(() => {
    send(draft);
    setDraft("");
  }, [send, draft]);

  useEffect(() => {
    if (initialConvId) setSelected(initialConvId);
  }, [initialConvId]);

  useEffect(() => {
    if (!peerParam || !uid || !hydrated || peerHandledRef.current) return;
    peerHandledRef.current = true;

    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("peer");
    const qs = sp.toString();

    const match = findConversationWithPeer(conversations, uid, peerParam);
    if (match) {
      setPeerNotFound(null);
      setSelected(match.id);
      router.replace(`${messagesConversationPath(match.id)}${qs ? `?${qs}` : ""}`, { scroll: false });
      return;
    }

    setPeerNotFound(peerParam);
    router.replace(`${messagesBase}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [peerParam, uid, hydrated, conversations, router, searchParams, messagesBase]);

  useEffect(() => {
    if (!peerParam) setPeerNotFound(null);
  }, [peerParam]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (threadVirtual.enabled && threadItems.length > 0) {
      threadVirtual.virtualizer.scrollToIndex(threadItems.length - 1, {
        align: "end",
        behavior: reduceMotion ? "auto" : "smooth",
      });
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "end" });
  }, [messages.length, activeId, reduceMotion, threadVirtual.enabled, threadItems.length, threadVirtual.virtualizer]);

  const renderInboxRow = (it: (typeof visibleItems)[number]) => {
    const c = it.row;
    const on = activeId === c.id;
    const k = kindOf(c);
    const row = ext(c);
    return (
      <button
        type="button"
        onClick={() => select(c.id)}
        className={cn("msg-conv-btn", on && "msg-conv-btn--active")}
      >
        <div className="msg-avatar-wrap">
          {c.avatar_url ? (
            <SafeAvatar src={c.avatar_url} alt="" size={40} className="h-10 w-10 rounded-full ring-1 ring-white/10" />
          ) : (
            <div className="msg-avatar-init">{c.title.slice(0, 1)}</div>
          )}
          {c.is_group && <span className="msg-group-badge">Grup</span>}
        </div>

        <div className="msg-conv-info">
          <div className="msg-kind-row">
            <span className="msg-kind-pill">{KIND_LABELS[k]}</span>
            {it.ring_labels.map((lb) => (
              <span key={lb} className="msg-ring-label">
                {lb}
              </span>
            ))}
          </div>
          <div className="msg-title-row">
            <span className="msg-conv-title">{c.title}</span>
            <span className="msg-conv-time">{formatSocialRelativeTime(c.last_message.created_at)}</span>
          </div>
          {c.subtitle && <div className="msg-conv-sub">{c.subtitle}</div>}
          {it.context_preview && <div className="msg-ctx-preview">{it.context_preview}</div>}
          {row.intel?.market_line && <div className="msg-market-line">{row.intel.market_line}</div>}
          <div className="msg-last-row">
            <div className="msg-last-msg">{c.last_message.content}</div>
            {c.unread_count > 0 && (
              <span className="msg-unread-badge" aria-label={`${c.unread_count} okunmamış`}>
                {c.unread_count > 99 ? "99+" : c.unread_count}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderThreadItem = (item: ThreadVirtualItem) => {
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

  const loginNext = pathname?.startsWith("/hub") ? pathname : "/hub/messages";

  /* ── loading ── */
  if (!isInitialized) {
    return (
      <HubPageShell zone="inbox" withMainArea={false} className="hp-canvas--embedded-inbox">
        <MessagesPageSkeleton />
      </HubPageShell>
    );
  }

  /* ── not logged in ── */
  if (!user) {
    return (
      <HubPageShell zone="inbox" withMainArea={false} className="hp-canvas--embedded-inbox">
        <div className="msg-canvas ms-page-wrapper--no-top min-w-0 px-5 py-8">
          <EmptyState
            title="Mesaj merkezi"
            description="Sohbetlerinizi görmek için oturum açın."
            actionLabel="Oturum aç"
            actionHref={`/auth/login?next=${encodeURIComponent(loginNext)}`}
            tone="social"
            compact
          />
        </div>
      </HubPageShell>
    );
  }

  /* ── live + empty ── */
  if (!mockOn && conversations.length === 0) {
    return (
      <HubPageShell zone="inbox" withMainArea={false} className="hp-canvas--embedded-inbox">
        <div className="msg-canvas ms-page-wrapper--no-top" style={{ width: "100%", minWidth: 0, padding: "24px 20px" }}>
          <EmptyState title="Henüz sohbet yok"
            description="Canlı modda doğrudan mesajlar bağlandığında konuşmalarınız burada listelenir."
            tone="social" compact />
        </div>
      </HubPageShell>
    );
  }

  /* ── main layout ── */
  return (
    <HubPageShell zone="inbox" withMainArea={false} className="hp-canvas--embedded-inbox">
    <div className={cn("msg-canvas msg-shell ms-container-wide", "min-w-0")}>

      {/* ── SIDEBAR ── */}
      <aside className={cn("msg-sidebar", activeId && "hidden min-[800px]:flex")}>

        {/* Header */}
        <div className="msg-sidebar-head">
          <span className="msg-sidebar-kicker">{hubPremiumKicker("inbox", "Mesajlar")}</span>
          <div className="msg-sidebar-title">{hub.headline}</div>
          <div className="msg-sidebar-sub">{hub.subline}</div>
          {hub.adaptive_line && <div className="msg-hub-note">{hub.adaptive_line}</div>}
          {hub.fatigue_note  && <div className="msg-hub-note">{hub.fatigue_note}</div>}

          {hub.nav_links.length > 0 && (
            <div className="msg-nav-links">
              {hub.nav_links.map((l) => (
                <Link key={l.href} href={l.href} className="msg-nav-link">{l.label}</Link>
              ))}
            </div>
          )}

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Sohbet ara…"
            className="msg-search"
          />

          {hub.strips.length > 0 && (
            <div className="msg-strips">
              {hub.strips.map((s) => (
                <Link key={s.id} href={s.href} className="msg-strip">
                  <div className="msg-strip-label">{s.label}</div>
                  <div className="msg-strip-sub">{s.sub}</div>
                </Link>
              ))}
            </div>
          )}

          <div className="msg-stream-tabs" role="tablist" aria-label="Gelen kutusu">
            {STREAMS.map((s) => {
              const on = stream === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  ref={(el) => { streamTabRefs.current[s.id] = el; }}
                  onClick={() => pushStream(s.id)}
                  onKeyDown={(e) => onStreamKeyDown(e, s.id)}
                  className={cn("msg-stream-btn", on ? "msg-stream-btn--on" : "msg-stream-btn--off")}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation list */}
        <ul ref={inboxVirtual.scrollRef as React.RefObject<HTMLUListElement>} className="msg-conv-list">
          {!hydrated && (
            <li style={{ padding: "10px 14px" }}>
              <SkeletonList count={4} />
            </li>
          )}
          {visibleItems.length === 0 && hydrated && (
            <li style={{ padding: "16px 14px" }}>
              <EmptyState title="Sonuç yok" description="Aramayı veya filtreyi değiştirin." tone="social" compact />
            </li>
          )}
          {inboxVirtual.enabled && inboxVirtual.virtualItems ? (
            <li
              className="virtual-list-spacer"
              style={{ height: inboxVirtual.totalSize, position: "relative", padding: 0, border: "none", listStyle: "none" }}
            >
              {inboxVirtual.virtualItems.map((vRow) => {
                const it = visibleItems[vRow.index]!;
                return (
                  <div
                    key={vRow.key}
                    className="msg-conv-item"
                    style={{ position: "absolute", top: vRow.start, left: 0, width: "100%" }}
                  >
                    {renderInboxRow(it)}
                  </div>
                );
              })}
            </li>
          ) : (
            visibleItems.map((it) => (
              <li key={it.row.id} className="msg-conv-item">
                {renderInboxRow(it)}
              </li>
            ))
          )}
        </ul>
      </aside>

      {/* ── THREAD ── */}
      <section className={cn("msg-thread", !activeId && "hidden min-[800px]:flex")}>
        {!activeId ? (
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
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
              <EmptyState title="Sohbet seçin"
                description="Akıştan bir konuşma seçerek bağlam ve mesajları görün."
                tone="social" compact />
            )}
          </div>
        ) : !hydrated ? (
          <div className="msg-bubbles" style={{ padding: "16px 20px" }}>
            <SkeletonList count={4} />
          </div>
        ) : !activeConv ? (
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
            <EmptyState
              title="Sohbet bulunamadı"
              description="Bu konuşma mevcut değil veya erişiminiz yok."
              actionLabel="Listeye dön"
              onAction={() => {
                setSelected(null);
                router.push(messagesBase);
              }}
              tone="social"
              compact
            />
          </div>
        ) : (
          <>
            {/* Thread header */}
            <header className="msg-thread-header">
              <div className="msg-thread-title-row">
                <button
                  type="button"
                  className="msg-back-btn"
                  onClick={() => {
                    setSelected(null);
                    router.push(messagesBase);
                  }}
                >
                  ← Liste
                </button>

                {activeConv && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                    {activeConv.avatar_url ? (
                      <SafeAvatar src={activeConv.avatar_url} alt="" size={34}
                        className="h-[34px] w-[34px] shrink-0 rounded-full ring-1 ring-white/10" />
                    ) : (
                      <div className="msg-peer-init shrink-0">{activeConv.title.slice(0, 1)}</div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 5, minWidth: 0 }}>
                        {peerHref ? (
                          <Link href={peerHref} className="msg-peer-name msg-peer-name-link">
                            {activeConv.title}
                          </Link>
                        ) : (
                          <span className="msg-peer-name">{activeConv.title}</span>
                        )}
                        <span className="msg-kind-header-pill">{KIND_LABELS[kindOf(activeConv)]}</span>
                      </div>
                      <div className="msg-peer-meta">
                        {activeConv.is_group ? "Grup" : "Direkt"}
                        {hydrated && activeConv.online_participant_ids.length ? " · çevrimiçi" : ""}
                        {activeExt?.intel?.trust_label ? ` · ${activeExt.intel.trust_label}` : ""}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {activeExt?.context && (
                <div className="msg-ctx-chips">
                  {activeExt.context.asset_tag && (
                    <Link href={`/markets/${encodeURIComponent(activeExt.context.asset_tag)}`} className="msg-ctx-chip">
                      {activeExt.context.asset_tag}
                    </Link>
                  )}
                  {activeExt.context.signal_href && (
                    <Link href={activeExt.context.signal_href} className="msg-ctx-chip">Sinyal</Link>
                  )}
                  {activeExt.context.room_href && (
                    <Link href={activeExt.context.room_href} className="msg-ctx-chip">Oda</Link>
                  )}
                  {activeExt.context.discussion_href && (
                    <Link href={activeExt.context.discussion_href} className="msg-ctx-chip">Tartışma</Link>
                  )}
                  {activeExt.context.portfolio_note && (
                    <Link href="/hub/portfolio" className="msg-ctx-chip">Portföy</Link>
                  )}
                </div>
              )}
            </header>

            {/* Bubbles */}
            <div ref={threadVirtual.scrollRef as React.RefObject<HTMLDivElement>} className="msg-bubbles">
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

            {/* Footer / composer */}
            <footer className="msg-footer">
              {suggestions.length > 0 && (
                <div className="msg-suggestions">
                  {suggestions.map((s) => (
                    <button key={s.id} type="button" className="msg-suggest-btn"
                      onClick={() => setDraft((d) => `${d}${s.insert_text}`)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="msg-input-row">
                <button type="button" disabled title="Ek (yakında)" aria-label="Dosya ekleme yakında"
                  className="msg-attach-btn">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </button>

                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
                  }}
                  placeholder="Bağlamlı yanıt yazın…"
                  className="msg-input"
                />

                <button type="button" onClick={onSend} disabled={!draft.trim()} className="msg-send-btn">
                  Gönder
                </button>
              </div>

              {mockOn && (
                <div className="msg-footer-note">Demo modu — mesajlar tarayıcıda saklanır.</div>
              )}
            </footer>
          </>
        )}
      </section>
    </div>
    </HubPageShell>
  );
}
