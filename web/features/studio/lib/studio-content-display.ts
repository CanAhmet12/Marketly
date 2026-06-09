import type { StudioContentKind, StudioContentStatus } from "@/features/studio/types";

export function contentKindShort(kind: string): string {
  const m: Record<string, string> = {
    video: "VID",
    live: "LIVE",
    signal: "SIG",
    post: "POST",
    short: "SHORT",
  };
  return m[kind] ?? "—";
}

export function contentKindBadgeClass(kind: string): string {
  const m: Record<string, string> = {
    video: "st-content-kind-badge--video",
    live: "st-content-kind-badge--live",
    signal: "st-content-kind-badge--signal",
    post: "st-content-kind-badge--post",
    short: "st-content-kind-badge--short",
  };
  return m[kind] ?? "st-content-kind-badge--post";
}

export function contentStatusBadgeClass(status: string): string {
  if (status === "published" || status === "live") return "st-content-status--published";
  if (status === "scheduled") return "st-content-status--scheduled";
  return "st-content-status--draft";
}

export function contentStatusLabel(status: StudioContentStatus): string {
  if (status === "published") return "Yayında";
  if (status === "live") return "Canlı";
  if (status === "scheduled") return "Zamanlı";
  if (status === "draft") return "Taslak";
  if (status === "archived") return "Arşiv";
  if (status === "processing") return "İşleniyor";
  return status;
}

export function contentKindLabelTr(kind: StudioContentKind): string {
  const m: Record<string, string> = {
    video: "Video",
    live: "Canlı",
    signal: "Sinyal",
    post: "Gönderi",
    short: "Short",
    draft: "Taslak",
    scheduled: "Zamanlı",
  };
  return m[kind] ?? kind;
}

export function contentVisibilityLabel(vis: string): string {
  if (vis === "public") return "Herkese açık";
  if (vis === "unlisted") return "Liste dışı";
  if (vis === "private") return "Gizli";
  return vis;
}

export function formatContentDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}
