export type CloseFriendsSectionId = "overview" | "circles" | "discover" | "feed";

const VALID: CloseFriendsSectionId[] = ["overview", "circles", "discover", "feed"];

export function resolveCloseFriendsSection(raw: string | null | undefined): CloseFriendsSectionId {
  if (raw && VALID.includes(raw as CloseFriendsSectionId)) return raw as CloseFriendsSectionId;
  return "overview";
}

export function closeFriendsSectionToParam(id: CloseFriendsSectionId): string {
  return id === "overview" ? "" : id;
}

export const CLOSE_FRIENDS_SECTION_LABELS: Record<CloseFriendsSectionId, string> = {
  overview: "Genel Bakış",
  circles: "Dairelerim",
  discover: "Keşfet",
  feed: "Özel Akış",
};
