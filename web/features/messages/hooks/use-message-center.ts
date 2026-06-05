"use client";

import { useMemo } from "react";

import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { getMessagesRepository } from "@/features/messages/repository";

export function useMessageCenter(userId: string | undefined, conversationId: string | null, inboxVersion: number) {
  const snap = usePersonalizationSnapshot();

  const hub = useMemo(() => {
    void snap.feedbackRev;
    void snap.adaptiveRev;
    void snap.explorationRev;
    void snap.recommendRev;
    void snap.watchRev;
    void snap.intel.headline;
    void snap.intel.subline;
    void inboxVersion;
    return getMessagesRepository().getMessageCenter(userId ?? null);
  }, [
    userId,
    snap.feedbackRev,
    snap.adaptiveRev,
    snap.explorationRev,
    snap.recommendRev,
    snap.watchRev,
    snap.intel.headline,
    snap.intel.subline,
    inboxVersion,
  ]);

  const suggestions = useMemo(() => {
    void snap.feedbackRev;
    void snap.intel.headline;
    void inboxVersion;
    return getMessagesRepository().getComposerSuggestions(userId ?? null, conversationId);
  }, [userId, conversationId, snap.feedbackRev, snap.intel.headline, inboxVersion]);

  return { hub, suggestions };
}
