"use client";

import { useEffect } from "react";

import type { MockAssetAlert } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { formatNasdaqTickerPrice } from "@/features/markets/nasdaq/lib/map-nasdaq-tickers";
import { isNasdaqIndexSymbol } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";

type Props = {
  open: boolean;
  onClose: () => void;
  symbol: string;
  price: number;
  alerts: MockAssetAlert[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
};

function fmtPrice(price: number, symbol: string): string {
  return formatNasdaqTickerPrice(price, symbol);
}

export function NasdaqDetailAlertSheet({
  open,
  onClose,
  symbol,
  price,
  alerts,
  onAdd,
  onRemove,
}: Props) {
  const sym = symbol.trim().toUpperCase();
  const unit = isNasdaqIndexSymbol(sym) ? "puan" : "USD";

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
  const spot = price > 0 ? fmtPrice(price, sym) : "—";

  return (
    <div className="cdr-alert-sheet" role="dialog" aria-modal="true" aria-label="Fiyat alarmları">
      <button type="button" className="cdr-alert-sheet__backdrop" aria-label="Kapat" onClick={onClose} />
      <aside className="cdr-alert-sheet__panel">
        <p className="cdr-alert-sheet__title">Fiyat alarmı</p>
        <p className="cdr-alert-sheet__sym">
          {sym} · NASDAQ
        </p>
        <p className="nqx-alert-sheet__spot">
          Canlı: <strong>{spot}</strong> {unit}
        </p>

        <div className="nqx-alert-sheet__presets">
          <button
            type="button"
            className="cdr-btn cdr-btn--ghost cdr-btn--wide"
            disabled={price <= 0}
            onClick={() => onAdd(`>${fmtPrice(above, sym)}`)}
          >
            +%2 üzeri ({fmtPrice(above, sym)})
          </button>
          <button
            type="button"
            className="cdr-btn cdr-btn--ghost cdr-btn--wide"
            disabled={price <= 0}
            onClick={() => onAdd(`<${fmtPrice(below, sym)}`)}
          >
            −%2 altı ({fmtPrice(below, sym)})
          </button>
        </div>

        {alerts.length === 0 ? (
          <p className="nqx-alert-sheet__empty">Henüz alarm yok.</p>
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
