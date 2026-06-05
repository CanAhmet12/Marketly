import type { StudioVisibility } from "@/features/studio/types";

export type StudioContentEdit = {
  title?: string;
  preview?: string;
  visibility?: StudioVisibility;
  updatedAt: string;
};

const KEY = "marketly-studio-content-edits-v1";

function readAll(): Record<string, StudioContentEdit> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StudioContentEdit>;
  } catch {
    return {};
  }
}

function writeAll(next: Record<string, StudioContentEdit>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* */
  }
}

export function readContentEdit(id: string): StudioContentEdit | null {
  return readAll()[id] ?? null;
}

export function saveContentEdit(id: string, patch: Omit<StudioContentEdit, "updatedAt">) {
  const all = readAll();
  all[id] = { ...all[id], ...patch, updatedAt: new Date().toISOString() };
  writeAll(all);
  return all[id]!;
}

export function applyContentEdits<T extends { id: string; title: string; preview: string; visibility: StudioVisibility }>(
  item: T,
): T {
  const edit = readContentEdit(item.id);
  if (!edit) return item;
  return {
    ...item,
    title: edit.title ?? item.title,
    preview: edit.preview ?? item.preview,
    visibility: edit.visibility ?? item.visibility,
  };
}
