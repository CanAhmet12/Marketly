"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  preview: string;
  shareText: string;
  url: string;
};

export function ShareSheet({ open, onClose, preview, shareText, url }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const canNativeShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const copy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(label);
        onClose();
      } catch {
        showToast("Kopyalanamadı");
      }
    },
    [onClose, showToast],
  );

  const onNativeShare = useCallback(async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({ title: "Marketly", text: shareText, url });
      onClose();
    } catch {
      /* iptal */
    }
  }, [canNativeShare, onClose, shareText, url]);

  if (!open) return null;

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <>
      <button type="button" className="ml-share-backdrop" onClick={onClose} aria-label="Paylaşımı kapat" />
      <div className="ml-share-sheet" role="dialog" aria-modal="true" aria-label="Paylaş">
        <div className="ml-share-sheet-head">
          <h3 className="ml-share-sheet-title">Paylaş</h3>
          <button type="button" className="ml-share-sheet-close" onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </div>

        <p className="ml-share-sheet-preview">{preview}</p>

        <div className="ml-share-sheet-actions">
          {canNativeShare ? (
            <button type="button" className="ml-share-action ml-share-action--primary" onClick={() => void onNativeShare()}>
              <span className="ml-share-action__icon" aria-hidden>⬆</span>
              Cihazda paylaş
            </button>
          ) : null}

          <button type="button" className="ml-share-action" onClick={() => void copy(url, "Bağlantı kopyalandı")}>
            <span className="ml-share-action__icon" aria-hidden>🔗</span>
            Bağlantıyı kopyala
          </button>

          <button type="button" className="ml-share-action" onClick={() => void copy(shareText, "Metin kopyalandı")}>
            <span className="ml-share-action__icon" aria-hidden>📋</span>
            Metin + bağlantı kopyala
          </button>

          <a href={xHref} target="_blank" rel="noopener noreferrer" className="ml-share-action" onClick={onClose}>
            <span className="ml-share-action__icon" aria-hidden>𝕏</span>
            X&apos;te paylaş
          </a>
        </div>
      </div>

      {toast ? (
        <div className="ml-share-toast" role="status">
          {toast}
        </div>
      ) : null}
    </>
  );
}
