import type { LiveChatRole } from "@/features/live/live-chat-row";

const MOD_NAMES = new Set(["moderatör", "moderator", "mod"]);

export function resolveChatRole(username: string, userId: string | null, hostUserId: string): LiveChatRole {
  if (userId && userId === hostUserId) return "host";
  const key = username.trim().toLowerCase();
  if (MOD_NAMES.has(key) || key.startsWith("mod ")) return "mod";
  return "viewer";
}
