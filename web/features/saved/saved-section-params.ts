export type SavedSectionId = "all" | "recent" | "video" | "markets";

const VALID: SavedSectionId[] = ["all", "recent", "video", "markets"];

export function resolveSavedSection(raw: string | null | undefined): SavedSectionId {
  if (raw && VALID.includes(raw as SavedSectionId)) return raw as SavedSectionId;
  return "all";
}

export function savedSectionToParam(id: SavedSectionId): string {
  return id === "all" ? "" : id;
}

export const SAVED_SECTION_LABELS: Record<SavedSectionId, string> = {
  all: "Tümü",
  recent: "Son 7 gün",
  video: "Video",
  markets: "Piyasa",
};
