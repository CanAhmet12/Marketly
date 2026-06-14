"use client";

import { useEffect } from "react";

import type { MockAssetAlert } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { fmtPriceUsd } from "@/features/markets/crypto/symbol-detail/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  symbol: string;
  price: number;
  alerts: MockAssetAlert[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
};

export function DetailAlertSheet({
  open,
  onClose,
  symbol,
  price,
  alerts,
  onAdd,
  onRemove,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const above = price * 1.02;
  const below = price * 0.98;

  return (
    <div className="cdr-alert-sheet" role="dialog" aria-modal="true" aria-label="Fiyat alarmları">
      <button type="button" className="cdr-alert-sheet__backdrop" aria-label="Kapat" onClick={onClose} />
      <aside className="cdr-alert-sheet__panel">
        <p className="cdr-alert-sheet__title">Fiyat alarmı</p>
        <p className="cdr-alert-sheet__sym">{symbol}</p>
        <p style={{ fontSize: 13, color: "var(--cdr-muted)", marginBottom: 16 }}>
          Spot: {fmtPriceUsd(price)}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <button type="button" className="cdr-btn cdr-btn--ghost cdr-btn--wide" onClick={() => onAdd(`>${fmtPriceUsd(above)}`)}>
            + %{2} üzeri ({fmtPriceUsd(above)})
          </button>
          <button type="button" className="cdr-btn cdr-btn--ghost cdr-btn--wide" onClick={() => onAdd(`<${fmtPriceUsd(below)}`)}>
            −%{2} altı ({fmtPriceUsd(below)})
          </button>
        </div>

        {alerts.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--cdr-muted)" }}>Henüz alarm yok.</p>
        ) : (
          <ul className="cdr-alert-sheet__list">
            {alerts.map((a) => (
              <li key={a.id} className="cdr-alert-sheet__row">
                <span>{a.label}</span>
                <button type="button" className="cdr-alert-sheet__remove" onClick={() => onRemove(a.id)}>
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
