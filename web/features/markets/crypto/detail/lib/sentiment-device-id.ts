const DEVICE_KEY = "marketly-sentiment-device-id";

/** Anonim sentiment oyları — mobil `device_id` ile uyumlu. */
export function getSentimentDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = `web_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return `web_${Date.now()}`;
  }
}
