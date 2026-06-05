"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSocialRepository } from "@/features/social/repository";
import type { Conversation, Message } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchConversations,
  fetchMessages,
  sendMessageRemote,
} from "@/features/messages/fetch-conversations";

const repo = () => getSocialRepository();

export function useMessageInbox(userId: string | undefined, conversationId: string | null) {
  const [version, setVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [liveConvs, setLiveConvs] = useState<Conversation[]>([]);
  const [liveMsgs, setLiveMsgs] = useState<Message[]>([]);
  const liveMode = !isMockDataEnabled() && isSupabaseConfigured();

  useEffect(() => {
    queueMicrotask(() => setHydrated(true));
  }, []);

  // Canlı modda: conversation listesini çek
  useEffect(() => {
    if (!userId || !liveMode) return;
    fetchConversations(getSupabaseBrowserClient(), userId).then(setLiveConvs);
  }, [userId, liveMode, version]);

  // Canlı modda: mesajları çek
  useEffect(() => {
    if (!conversationId || !liveMode) return;
    fetchMessages(getSupabaseBrowserClient(), conversationId).then(setLiveMsgs);
  }, [conversationId, liveMode, version]);

  useEffect(() => {
    if (!userId || !conversationId) return;
    if (!liveMode) repo().markConversationOpened(userId, conversationId);
    const id = requestAnimationFrame(() => {
      setVersion((v) => v + 1);
    });
    return () => cancelAnimationFrame(id);
  }, [userId, conversationId, liveMode]);

  const conversations = useMemo(() => {
    void version;
    if (liveMode) return liveConvs;
    return userId ? repo().getConversations(userId) : [];
  }, [userId, version, liveMode, liveConvs]);

  const messages = useMemo(() => {
    if (!userId || !conversationId) return [];
    void version;
    if (liveMode) return liveMsgs;
    return repo().getConversationMessages(userId, conversationId);
  }, [userId, conversationId, version, liveMode, liveMsgs]);

  const send = useCallback(
    (text: string) => {
      if (!userId || !conversationId || !text.trim()) return;
      if (liveMode) {
        sendMessageRemote(getSupabaseBrowserClient(), userId, conversationId, text)
          .then(() => setVersion((v) => v + 1));
      } else {
        repo().sendMessage(userId, conversationId, text);
        setVersion((v) => v + 1);
      }
    },
    [userId, conversationId, liveMode],
  );

  return { conversations, messages, send, hydrated, version };
}
