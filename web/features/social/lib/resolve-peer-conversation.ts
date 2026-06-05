import type { Conversation } from "@/features/social/repository";

/** DM sohbetini peer (karşı taraf user id) ile bul */
export function findConversationWithPeer(
  conversations: readonly Conversation[],
  viewerId: string,
  peerId: string,
): Conversation | null {
  const peer = peerId.trim();
  if (!peer || !viewerId) return null;
  return (
    conversations.find(
      (c) =>
        !c.is_group &&
        c.participant_ids.includes(viewerId) &&
        c.participant_ids.includes(peer),
    ) ?? null
  );
}
