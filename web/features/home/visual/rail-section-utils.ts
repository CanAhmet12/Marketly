/** Sağ rail bölüm yardımcıları — saf UI mantığı */

export function estimateReadMinutes(title: string): number {
  const words = title.trim().split(/\s+/).length;
  return Math.max(1, Math.min(5, Math.ceil(words / 18)));
}

export function isFreshNewsTime(timeAgo: string): boolean {
  const m = timeAgo.match(/(\d+)\s*dk/i);
  if (m) return parseInt(m[1]!, 10) <= 45;
  return timeAgo.includes("dk") && !timeAgo.includes("s") && !timeAgo.includes("g");
}

export function newsSentimentMeta(sentiment?: string | null): {
  label: string;
  tone: "up" | "down" | "flat";
} | null {
  const s = (sentiment ?? "").toLowerCase();
  if (s === "positive") return { label: "Olumlu", tone: "up" };
  if (s === "negative") return { label: "Olumsuz", tone: "down" };
  if (s === "neutral") return { label: "Nötr", tone: "flat" };
  return null;
}

export function moodScorePct(up: number, down: number, total: number): number {
  if (total <= 0) return 50;
  return Math.round((up / total) * 100);
}
