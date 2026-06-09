/** Mesaj merkezi — kanonik rotalar (Kanalım hub altında) */

export const MESSAGES_INBOX_PATH = "/hub/messages";

export function messagesConversationPath(conversationId: string): string {
  return `${MESSAGES_INBOX_PATH}/${encodeURIComponent(conversationId)}`;
}

export function messagesInboxWithPeer(peerUserId: string): string {
  return `${MESSAGES_INBOX_PATH}?peer=${encodeURIComponent(peerUserId)}`;
}

/** Eski `/messages` bookmark ve bildirim linkleri için */
export function resolveMessagesBase(pathname: string): string {
  if (pathname.startsWith(MESSAGES_INBOX_PATH)) return MESSAGES_INBOX_PATH;
  if (pathname.startsWith("/messages")) return MESSAGES_INBOX_PATH;
  return MESSAGES_INBOX_PATH;
}
