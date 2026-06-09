export function buildPostShareText(
  authorName: string,
  content: string | null | undefined,
  title: string | null | undefined,
  url: string,
): string {
  const snippet = content?.trim()
    ? `${content.slice(0, 140)}${content.length > 140 ? "…" : ""}`
    : title || "Marketly gönderisi";
  return `${authorName}: ${snippet}\n${url}`;
}

export function buildPostSharePreview(
  authorName: string,
  content: string | null | undefined,
  title: string | null | undefined,
): string {
  const body = title || content?.slice(0, 72) || "Gönderi";
  return `${authorName} — ${body}`;
}
