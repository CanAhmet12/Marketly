import { liveHrefForPostId } from "@/features/live/live-href";
import { pulseHrefForPostId } from "@/features/pulse/pulse-href";

/** Post tipi → public görüntüleme rotası */
export function studioContentHref(
  type: string | null | undefined,
  id: string,
): string {
  const t = (type ?? "post").toLowerCase();
  if (t === "video") return `/watch/${encodeURIComponent(id)}`;
  if (t === "short") return pulseHrefForPostId(id);
  if (t === "live") return liveHrefForPostId(id);
  if (t === "signal") return "/signals";
  return `/post/${encodeURIComponent(id)}`;
}

export function studioContentKindLabel(type: string | null | undefined): string {
  const t = (type ?? "post").toLowerCase();
  if (t === "video") return "video";
  if (t === "short") return "short";
  if (t === "signal") return "signal";
  if (t === "live") return "live";
  return "post";
}
