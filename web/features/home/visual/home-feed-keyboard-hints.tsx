"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "marketly-home-kbd-hint-dismissed";

const HINTS = [
  { key: "N", label: "Gönderi oluştur" },
  { key: "J", label: "Sekme değiştir" },
  { key: "R", label: "Akışı yenile" },
] as const;

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

type Props = {
  enabled?: boolean;
};

export function HomeFeedKeyboardHints({ enabled = true }: Props) {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    markDismissed();
  }, []);

  useEffect(() => {
    if (!enabled || wasDismissed()) return;
    const timer = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (["n", "N", "j", "J", "r", "R"].includes(e.key)) dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss, visible]);

  if (!visible) return null;

  return (
    <div className="hv-ref-kbd-hint" role="status" aria-live="polite">
      <div className="hv-ref-kbd-hint__head">
        <span className="hv-ref-kbd-hint__title">Klavye kısayolları</span>
        <button type="button" className="hv-ref-kbd-hint__close" onClick={dismiss} aria-label="Kapat">
          ✕
        </button>
      </div>
      <ul className="hv-ref-kbd-hint__list">
        {HINTS.map((h) => (
          <li key={h.key} className="hv-ref-kbd-hint__row">
            <kbd className="hv-ref-kbd-hint__key">{h.key}</kbd>
            <span>{h.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
