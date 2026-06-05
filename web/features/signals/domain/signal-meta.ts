import type { ChannelSignal } from "@/features/channel/types";

/** App `signals` + `result` / `is_active` ile uyumlu durum anahtarı */
export type SignalStatusKey = "open" | "closed" | "tp" | "sl";

/** Pazar yüzeyi — sonuç + ilerleme hissi (mock ilerleme deterministik) */
export type SignalLifecyclePhase =
  | "open"
  | "developing"
  | "near_target"
  | "target_hit"
  | "stopped_out"
  | "expired"
  | "closed_win"
  | "closed_loss";

export function signalStatusKey(s: Pick<ChannelSignal, "is_active" | "result">): SignalStatusKey {
  if (s.result === "TP") return "tp";
  if (s.result === "SL") return "sl";
  return s.is_active ? "open" : "closed";
}

export function signalStatusLabel(key: SignalStatusKey): string {
  const m: Record<SignalStatusKey, string> = {
    open: "Aktif",
    closed: "Kapanmış",
    tp: "Hedef",
    sl: "Stop",
  };
  return m[key];
}

export function hashToUnit(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return (h >>> 0) / 0xffff_ffff;
}

export function deriveSignalLifecycle(s: Pick<ChannelSignal, "id" | "is_active" | "result">): SignalLifecyclePhase {
  if (s.result === "TP") return "closed_win";
  if (s.result === "SL") return "stopped_out";
  if (!s.is_active) return "expired";
  const u = hashToUnit(s.id);
  if (u < 0.2) return "open";
  if (u < 0.52) return "developing";
  if (u < 0.78) return "near_target";
  return "target_hit";
}

export function signalLifecycleLabel(phase: SignalLifecyclePhase): string {
  const m: Record<SignalLifecyclePhase, string> = {
    open: "Açık",
    developing: "Gelişiyor",
    near_target: "Hedefe yakın",
    target_hit: "Hedef baskısı",
    stopped_out: "Stop oldu",
    expired: "Süresi doldu",
    closed_win: "Kapanış +",
    closed_loss: "Kapanış −",
  };
  return m[phase];
}

/** Şema `expires_at` mock — oluşturma + 7 gün */
export function mockExpiresAtIso(createdAt: string): string {
  const t = new Date(createdAt).getTime() + 7 * 86400000;
  return new Date(t).toISOString();
}

export function buildSignalClipboardText(row: {
  symbol: string;
  direction: string;
  entry_price: number | null;
  target_price: number | null;
  stop_loss: number | null;
  timeframe: string;
  rationale: string | null;
}): string {
  const lines = [
    `${row.symbol} ${row.direction} sinyali`,
    `Giriş: ${row.entry_price ?? "—"}`,
    `Hedef: ${row.target_price ?? "—"}`,
    `Stop: ${row.stop_loss ?? "—"}`,
    `Vade: ${row.timeframe}`,
    row.rationale?.trim() ? `\n${row.rationale.trim()}` : "",
  ];
  return lines.join("\n");
}
