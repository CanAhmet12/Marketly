const LS_KEY = "marketly-mock-creator-follows-v1";

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function mockIsFollowingCreator(creatorId: string, viewerId: string | null, defaultFollowing: string[]): boolean {
  const set = readSet();
  if (set.has(`+${creatorId}`)) return true;
  if (set.has(`-${creatorId}`)) return false;
  return defaultFollowing.includes(creatorId);
}

export function mockToggleCreatorFollow(creatorId: string, next: boolean) {
  const set = readSet();
  set.delete(`+${creatorId}`);
  set.delete(`-${creatorId}`);
  set.add(next ? `+${creatorId}` : `-${creatorId}`);
  writeSet(set);
}
