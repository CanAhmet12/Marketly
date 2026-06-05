"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/features/auth/use-auth";
import {
  fetchLiveMessages,
  incrementLiveViewers,
  sendLiveMessage,
  type LiveChatMessage,
} from "@/features/live/fetch-live-messages";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useLiveChat(postId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [mockMessages, setMockMessages] = useState<LiveChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const prevLenRef = useRef(0);
  const [unseenCount, setUnseenCount] = useState(0);
  const mockOn = isMockDataEnabled();

  const query = useQuery({
    queryKey: ["live-chat", postId] as const,
    enabled: Boolean(postId) && (mockOn || isSupabaseConfigured()),
    queryFn: async () => {
      if (mockOn || !isSupabaseConfigured()) {
        return fetchLiveMessages(null, postId);
      }
      return fetchLiveMessages(getSupabaseBrowserClient(), postId);
    },
  });

  useEffect(() => {
    if (!postId || mockOn || !isSupabaseConfigured()) return;
    const client = getSupabaseBrowserClient();
    void incrementLiveViewers(client, postId);

    const channel = client
      .channel(`web_live_chat_${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_messages", filter: `post_id=eq.${postId}` },
        () => {
          void qc.invalidateQueries({ queryKey: ["live-chat", postId] });
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [postId, mockOn, qc]);

  const messages = mockOn ? [...(query.data ?? []), ...mockMessages] : (query.data ?? []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 72;
      if (atBottom) setUnseenCount(0);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [messages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) {
      prevLenRef.current = messages.length;
      return;
    }

    const delta = messages.length - prevLenRef.current;
    prevLenRef.current = messages.length;
    if (delta <= 0) return;

    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 72;
    if (atBottom) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: delta > 2 ? "auto" : "smooth" });
      });
      setUnseenCount(0);
    } else {
      setUnseenCount((c) => c + delta);
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setUnseenCount(0);
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || !user?.id) return { ok: false as const, error: "auth" };

    if (mockOn) {
      const row: LiveChatMessage = {
        id: `mock-live-${Date.now()}`,
        post_id: postId,
        user_id: user.id,
        username: user.displayName ?? "Sen",
        content,
        is_gift: false,
        gift_icon: null,
        gift_name: null,
        avatar_url: user.avatarUrl ?? null,
        created_at: new Date().toISOString(),
      };
      setMockMessages((prev) => [...prev, row]);
      return { ok: true as const };
    }

    if (!isSupabaseConfigured()) {
      return { ok: false as const, error: "Supabase yapılandırılmadı" };
    }

    const client = getSupabaseBrowserClient();
    return sendLiveMessage(client, {
      postId,
      userId: user.id,
      username: user.displayName ?? "Kullanıcı",
      avatarUrl: user.avatarUrl ?? null,
      content,
    });
  };

  return { messages, query, scrollRef, scrollToBottom, unseenCount, send, user };
}
