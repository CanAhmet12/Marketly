"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { MessagesDigestRail } from "@/features/messages/components/messages-digest-rail";
import { MessagesInboxList } from "@/features/messages/components/messages-inbox-list";
import { MessagesIntelStrip } from "@/features/messages/components/messages-intel-strip";
import { MessagesNavRail } from "@/features/messages/components/messages-nav-rail";
import { MessagesPageHeader } from "@/features/messages/components/messages-page-header";
import { MessagesPanelToolbar } from "@/features/messages/components/messages-panel-toolbar";
import { MessagesQuickLinks } from "@/features/messages/components/messages-quick-links";
import { MessagesSidebarToolbar } from "@/features/messages/components/messages-sidebar-toolbar";
import { MessagesPageSkeleton } from "@/features/messages/components/messages-states";
import { MessagesThreadPane } from "@/features/messages/components/messages-thread-pane";
import type { MessageInboxStreamId } from "@/features/messages/domain/types";
import { useMessageCenter } from "@/features/messages/hooks/use-message-center";
import {
  buildMessageIntel,
  buildStreamUnreadCounts,
} from "@/features/messages/lib/build-message-intel";
import {
  MESSAGE_STREAM_LABELS,
  messageStreamToParam,
  resolveMessageStream,
} from "@/features/messages/messages-section-params";
import {
  MESSAGES_INBOX_PATH,
  messagesConversationPath,
  resolveMessagesBase,
} from "@/features/messages/routes";
import { buildThreadVirtualItems } from "@/features/social/lib/build-thread-virtual-items";
import { useMessageInbox } from "@/features/social/hooks/use-message-inbox";
import { findConversationWithPeer } from "@/features/social/lib/resolve-peer-conversation";
import {
  MESSAGES_INBOX_ITEM_ESTIMATE,
  MESSAGES_THREAD_BUBBLE_ESTIMATE,
  MESSAGES_THREAD_DAY_ESTIMATE,
  useContainerVirtualList,
  useContainerVirtualListVariable,
} from "@/hooks/use-virtual-list";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

type Props = { conversationId?: string | null };

export function MessagesHubClient({ conversationId: initialConvId = null }: Props) {
  const mockOn = isMockDataEnabled();
  const reduceMotion = usePrefersReducedMotion();
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uid = user?.id ?? "";

  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [peerNotFound, setPeerNotFound] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const peerHandledRef = useRef(false);

  const peerParam = searchParams.get("peer")?.trim() || null;
  const unreadOnly = searchParams.get("unread") === "1";
  const stream = useMemo(() => resolveMessageStream(searchParams.get("stream")), [searchParams]);
  const messagesBase = useMemo(() => resolveMessagesBase(pathname ?? ""), [pathname]);

  const replaceParams = useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(searchParams.toString());
      mutate(sp);
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const pushStream = useCallback(
    (id: MessageInboxStreamId) => {
      replaceParams((sp) => {
        const param = messageStreamToParam(id);
        if (param) sp.set("stream", param);
        else sp.delete("stream");
      });
    },
    [replaceParams],
  );

  const toggleUnreadOnly = useCallback(() => {
    replaceParams((sp) => {
      if (sp.get("unread") === "1") sp.delete("unread");
      else sp.set("unread", "1");
    });
  }, [replaceParams]);

  const onIntelStatAction = useCallback(
    (action: "unread" | "important" | "close" | "all") => {
      if (action === "unread") {
        toggleUnreadOnly();
        return;
      }
      if (action === "important") pushStream("important");
      else if (action === "close") pushStream("close");
      else pushStream("all");
    },
    [toggleUnreadOnly, pushStream],
  );

  const activeId = initialConvId ?? selected;
  const { conversations, messages, send, hydrated, version } = useMessageInbox(user?.id, activeId);
  const { hub, suggestions } = useMessageCenter(user?.id, activeId, version);

  const intel = useMemo(() => buildMessageIntel(hub.items), [hub.items]);
  const streamCounts = useMemo(() => buildStreamUnreadCounts(hub.items), [hub.items]);

  const visibleItems = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let items = hub.items;
    if (stream !== "all") items = items.filter((i) => i.streams.includes(stream));
    if (unreadOnly) items = items.filter((i) => i.row.unread_count > 0);
    if (qq) {
      items = items.filter(
        (i) =>
          i.row.title.toLowerCase().includes(qq) ||
          (i.row.subtitle ?? "").toLowerCase().includes(qq) ||
          i.row.last_message.content.toLowerCase().includes(qq),
      );
    }
    return items;
  }, [hub.items, stream, q, unreadOnly]);

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

  const onBack = useCallback(() => {
    setSelected(null);
    router.push(messagesBase);
  }, [router, messagesBase]);

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

  const loginNext = pathname?.startsWith("/hub") ? pathname : MESSAGES_INBOX_PATH;
  const streamLabel = MESSAGE_STREAM_LABELS[stream];

  const pageHeader = (
    <MessagesPageHeader
      title={user ? hub.headline : "Mesaj merkezi"}
      subtitle={user ? hub.subline : "Creator, sinyal ve piyasa bağlamlı sohbetler burada toplanır."}
      unreadCount={intel.unread}
      unreadOnly={unreadOnly}
      onToggleUnread={user ? toggleUnreadOnly : undefined}
    />
  );

  if (!isInitialized) {
    return (
      <HubPageShell zone="inbox" withMainArea={false} className="hp-canvas--embedded-inbox" header={pageHeader}>
        <MessagesPageSkeleton />
      </HubPageShell>
    );
  }

  if (!user) {
    return (
      <HubPageShell zone="inbox" withMainArea={false} className="hp-canvas--embedded-inbox" header={pageHeader}>
        <div className="msg-studio">
          <div className="msg-page">
            <div className="msg-surface msg-panel-empty">
              <EmptyState
                title="Mesaj merkezi"
                description="Sohbetlerinizi görmek için oturum açın."
                actionLabel="Oturum aç"
                actionHref={`/auth/login?next=${encodeURIComponent(loginNext)}`}
                tone="social"
                compact
              />
            </div>
          </div>
        </div>
      </HubPageShell>
    );
  }

  if (!mockOn && conversations.length === 0) {
    return (
      <HubPageShell zone="inbox" withMainArea={false} className="hp-canvas--embedded-inbox" header={pageHeader}>
        <div className="msg-studio">
          <div className="msg-page">
            <div className="msg-surface msg-panel-empty">
              <EmptyState
                title="Henüz sohbet yok"
                description="Canlı modda doğrudan mesajlar bağlandığında konuşmalarınız burada listelenir."
                tone="social"
                compact
              />
            </div>
          </div>
        </div>
      </HubPageShell>
    );
  }

  return (
    <HubPageShell zone="inbox" withMainArea={false} className="hp-canvas--embedded-inbox" header={pageHeader}>
      <div className="msg-studio">
        <div className="msg-page">
          <MessagesIntelStrip
            hub={hub}
            intel={intel}
            hydrated={hydrated}
            streamLabel={streamLabel}
            unreadOnly={unreadOnly}
            onStatAction={onIntelStatAction}
          />

          <MessagesNavRail active={stream} onSelect={pushStream} counts={streamCounts} />

          {hub.strips.length > 0 ? <MessagesDigestRail strips={hub.strips} /> : null}

          <div className={cn("msg-surface msg-shell", "min-w-0")}>
            <aside className={cn("msg-sidebar", activeId && "hidden min-[800px]:flex")}>
              <MessagesSidebarToolbar value={q} onChange={setQ} />

              <MessagesPanelToolbar
                stream={stream}
                visibleCount={visibleItems.length}
                totalUnread={intel.unread}
                mockOn={mockOn}
                unreadOnly={unreadOnly}
                onToggleUnread={toggleUnreadOnly}
              />

              {hub.nav_links.length > 0 ? (
                <div className="msg-sidebar-links">
                  <MessagesQuickLinks links={hub.nav_links} />
                </div>
              ) : null}

              <MessagesInboxList
                items={visibleItems}
                activeId={activeId}
                hydrated={hydrated}
                onSelect={select}
                inboxVirtual={inboxVirtual}
              />
            </aside>

            <MessagesThreadPane
              activeId={activeId}
              activeConv={activeConv}
              messages={messages}
              uid={uid}
              hydrated={hydrated}
              peerNotFound={peerNotFound}
              messagesBase={messagesBase}
              suggestions={suggestions}
              draft={draft}
              mockOn={mockOn}
              reduceMotion={reduceMotion}
              threadVirtual={threadVirtual}
              threadItems={threadItems}
              bottomRef={bottomRef}
              streamLabel={streamLabel}
              visibleCount={visibleItems.length}
              onBack={onBack}
              onDraftChange={setDraft}
              onSend={onSend}
              onSuggestion={(text) => setDraft((d) => `${d}${text}`)}
            />
          </div>
        </div>
      </div>
    </HubPageShell>
  );
}
