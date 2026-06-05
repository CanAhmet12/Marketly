/** Pulse (kısa form) kanonik rota */
export function pulseHrefForPostId(postId: string): string {
  return `/pulse/${encodeURIComponent(postId)}`;
}

export function isPulsePath(pathname: string): boolean {
  return pathname.startsWith("/pulse/") && pathname !== "/pulse";
}
