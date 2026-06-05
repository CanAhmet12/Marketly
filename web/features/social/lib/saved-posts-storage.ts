const KEY = "marketly-posts-saved-v1";

export function readSavedPostIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSavedPostIds(next: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* */
  }
}

/** Mock modda kaydet / kaldır — gerçek backend `saved_posts` tablosu ile aynı davranış */
export function persistSavedPostToggle(postId: string, currentlySaved: boolean) {
  const next = readSavedPostIds();
  if (currentlySaved) next.delete(postId);
  else next.add(postId);
  writeSavedPostIds(next);
}
