import type { NotificationItem } from "@/features/social/repository";
import type { MockNotificationType } from "@/features/social/types";
import type { AffinityContext } from "@/features/personalization/domain/personalization-types";

import { userResponseRate } from "./notification-action-store";

export type NotificationImportance = "critical" | "high" | "normal";

const IMPORTANCE_MAP: Partial<Record<MockNotificationType, number>> = {
  macro_alert: 0.95,
  target_stop: 0.92,
  portfolio_intel: 0.88,
  premium_signal: 0.86,
  signal_lifecycle: 0.84,
  price_alert: 0.82,
  market_move: 0.8,
  live_started: 0.78,
  recommendation_update: 0.72,
  signal_copied: 0.7,
  watchlist_intel: 0.68,
  strategy_fit: 0.66,
  rising_theme: 0.64,
  creator_reply: 0.62,
  discussion_mention: 0.6,
  mention: 0.58,
  comment: 0.55,
  follow: 0.52,
  like: 0.45,
  message: 0.7,
  system: 0.4,
};

const GROUPABLE_TYPES = new Set<MockNotificationType>([
  "like",
  "comment",
  "follow",
  "signal_copied",
  "premium_signal",
  "signal_lifecycle",
  "market_move",
  "price_alert",
  "watchlist_intel",
]);

function entitySymbol(row: NotificationItem): string | null {
  const sym = row.entity_id?.trim().toUpperCase();
  return sym && sym.length <= 12 ? sym : null;
}

/** 0–1 affinity eşleşmesi — varlık / üretici / sinyal */
export function calculateAffinityMatch(row: NotificationItem, affinity: AffinityContext | null): number {
  if (!affinity || affinity.meta.eventCount < 2) return 0.45;

  let score = 0.35;
  const sym = entitySymbol(row);
  if (sym && affinity.assets[sym]) {
    score += Math.min(0.45, affinity.assets[sym]! * 0.008);
  }
  if (row.actor_id && affinity.creators[row.actor_id]) {
    score += Math.min(0.35, affinity.creators[row.actor_id]! * 0.006);
  }
  const t = row.type as MockNotificationType;
  if (
    (t === "premium_signal" || t === "signal_lifecycle" || t === "signal_copied" || t === "target_stop") &&
    sym &&
    affinity.signals[sym]
  ) {
    score += 0.12;
  }
  const token = (row as NotificationItem & { relevance_token?: string | null }).relevance_token;
  if (token && affinity.topics[token.toLowerCase()]) {
    score += 0.1;
  }
  return Math.min(1, score);
}

function importanceScore(imp: NotificationImportance, type: MockNotificationType): number {
  const base = IMPORTANCE_MAP[type] ?? 0.5;
  if (imp === "critical") return Math.min(1, base + 0.12);
  if (imp === "high") return Math.min(1, base + 0.06);
  return base;
}

/** Twitter/X tarzı: tazelik × önem × alaka × yanıt geçmişi */
export function personalPriorityScore(
  row: NotificationItem,
  imp: NotificationImportance,
  affinity: AffinityContext | null,
): number {
  const ageHours = (Date.now() - new Date(row.created_at).getTime()) / 3_600_000;
  const ageDecay = Math.exp(-0.1 * ageHours);
  const importance = importanceScore(imp, row.type as MockNotificationType);
  const affinityMatch = calculateAffinityMatch(row, affinity);
  const actionHistory = userResponseRate(row.type);

  const blended =
    ageDecay * 0.35 + importance * 0.3 + affinityMatch * 0.25 + actionHistory * 0.1;

  return Math.round(blended * 1000) / 10;
}

/** Eski skor — flag kapalıyken */
export function legacyPriorityScore(row: NotificationItem, imp: NotificationImportance): number {
  const ageMs = Date.now() - new Date(row.created_at).getTime();
  const recency = Math.max(0, 100 - Math.floor(ageMs / 3_600_000));
  const bump = imp === "critical" ? 40 : imp === "high" ? 22 : 0;
  return bump + recency;
}

export type NotificationGroupMeta = {
  batch_key: string;
  group_label: string;
};

const GROUP_LABELS: Partial<Record<MockNotificationType, (n: number, entity: string) => string>> = {
  like: (n) => `${n} kişi gönderinizi beğendi`,
  comment: (n) => `${n} yeni yorum`,
  follow: (n) => `${n} yeni takipçi`,
  signal_copied: (n, e) => `${n} kişi ${e} sinyalinizi kopyaladı`,
  premium_signal: (n, e) => `${n} ${e} sinyal güncellemesi`,
  signal_lifecycle: (n, e) => `${n} ${e} sinyal olayı`,
  market_move: (n, e) => `${n} ${e} piyasa hareketi`,
  price_alert: (n, e) => `${n} ${e} fiyat uyarısı`,
  watchlist_intel: (n, e) => `${n} ${e} liste uyarısı`,
};

/** Akıllı gruplandırma — aynı tür + entity + gün */
export function computeNotificationGroups(
  rows: readonly NotificationItem[],
): Map<string, NotificationGroupMeta> {
  const out = new Map<string, NotificationGroupMeta>();
  const buckets = new Map<string, NotificationItem[]>();

  for (const row of rows) {
    const t = row.type as MockNotificationType;
    if (!GROUPABLE_TYPES.has(t)) continue;
    const existing = (row as NotificationItem & { batch_key?: string | null }).batch_key;
    if (existing) continue;

    const day = row.created_at.slice(0, 10);
    const entity = row.entity_id ?? "general";
    const bucket = `${t}|${entity}|${day}`;
    const list = buckets.get(bucket) ?? [];
    list.push(row);
    buckets.set(bucket, list);
  }

  for (const [bucket, group] of buckets) {
    if (group.length < 2) continue;
    const t = group[0]!.type as MockNotificationType;
    const entity = entitySymbol(group[0]!) ?? group[0]!.entity_id ?? "";
    const batch_key = `grp-${bucket.replace(/\|/g, "-")}`;
    const labelFn = GROUP_LABELS[t];
    const group_label = labelFn
      ? labelFn(group.length, entity)
      : `${group.length} benzer bildirim`;
    for (const row of group) {
      out.set(row.id, { batch_key, group_label });
    }
  }

  return out;
}

export function formatNotificationGroupLabel(items: readonly { group_label?: string | null }[]): string {
  return items[0]?.group_label ?? `${items.length} bildirim`;
}
