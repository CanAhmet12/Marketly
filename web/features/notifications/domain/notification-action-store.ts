/** Bildirim türü bazlı yanıt geçmişi — localStorage (Sprint 10) */

const LS_KEY = "marketly-notif-action-v1";

type ActionState = {
  opened: Record<string, number>;
  read: Record<string, number>;
  dismissed: Record<string, number>;
  updatedAt: number;
};

function empty(): ActionState {
  return { opened: {}, read: {}, dismissed: {}, updatedAt: Date.now() };
}

function readState(): ActionState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as Partial<ActionState>;
    return {
      opened: p.opened ?? {},
      read: p.read ?? {},
      dismissed: p.dismissed ?? {},
      updatedAt: p.updatedAt ?? Date.now(),
    };
  } catch {
    return empty();
  }
}

function writeState(s: ActionState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ...s, updatedAt: Date.now() }));
  } catch {
    /* */
  }
}

function bump(map: Record<string, number>, type: string): Record<string, number> {
  return { ...map, [type]: (map[type] ?? 0) + 1 };
}

export function recordNotificationOpened(type: string): void {
  const s = readState();
  writeState({ ...s, opened: bump(s.opened, type) });
}

export function recordNotificationRead(type: string): void {
  const s = readState();
  writeState({ ...s, read: bump(s.read, type) });
}

export function recordNotificationDismissed(type: string): void {
  const s = readState();
  writeState({ ...s, dismissed: bump(s.dismissed, type) });
}

/** 0–1: kullanıcı bu tür bildirimlere geçmişte yanıt vermiş mi */
export function userResponseRate(type: string): number {
  const s = readState();
  const opened = s.opened[type] ?? 0;
  const read = s.read[type] ?? 0;
  const dismissed = s.dismissed[type] ?? 0;
  const total = opened + read + dismissed;
  if (total === 0) return 0.45;
  const positive = opened * 0.6 + read * 0.35;
  return Math.min(1, Math.max(0.1, positive / Math.max(total, 1)));
}
