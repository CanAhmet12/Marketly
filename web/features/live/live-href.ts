/** Canlı yayın izleme — kanonik rota */
export function liveHrefForPostId(postId: string): string {
  return `/live/${encodeURIComponent(postId)}`;
}

export function isLiveWatchPath(pathname: string): boolean {
  return pathname.startsWith("/live/") && pathname !== "/live";
}
