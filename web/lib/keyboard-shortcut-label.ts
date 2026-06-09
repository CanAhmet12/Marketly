/** Platforma göre gönder kısayolu etiketi */
export function sendShortcutLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl+Enter";
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "⌘+Enter" : "Ctrl+Enter";
}
