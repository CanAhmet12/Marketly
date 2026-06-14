"use client";

import { useEffect } from "react";

import type { MockAssetAlert } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import { addPips, pipSize } from "@/features/markets/forex/lib/forex-pip-utils";
import { forexPairLabel, normalizeForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";

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
  return formatForexTickerPrice(price, symbol);
}

export function ForexDetailAlertSheet({
  open,
  onClose,
  symbol,
  price,
  alerts,
  onAdd,
  onRemove,
}: Props) {
  const sym = normalizeForexSymbol(symbol);
  const pair = forexPairLabel(sym);

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

  const pip = pipSize(sym);
  const above10 = addPips(price, 10, sym);
  const below10 = addPips(price, -10, sym);
  const above25 = addPips(price, 25, sym);
  const below25 = addPips(price, -25, sym);
  const spot = price > 0 ? fmtPrice(price, sym) : "—";

  return (
    <div className="cdr-alert-sheet" role="dialog" aria-modal="true" aria-label="Kur alarmları">
      <button type="button" className="cdr-alert-sheet__backdrop" aria-label="Kapat" onClick={onClose} />
      <aside className="cdr-alert-sheet__panel">
        <p className="cdr-alert-sheet__title">Kur alarmı</p>
        <p className="cdr-alert-sheet__sym">
          {pair} · Forex
        </p>
        <p className="fx-alert-sheet__spot">
          Canlı: <strong>{spot}</strong> · pip {pip.toFixed(pip >= 0.01 ? 2 : 4)}
        </p>

        <div className="fx-alert-sheet__presets">
          <button
            type="button"
            className="cdr-btn cdr-btn--ghost cdr-btn--wide"
            disabled={price <= 0}
            onClick={() => onAdd(`+10 pip (${fmtPrice(above10, sym)})`)}
          >
            +10 pip ({fmtPrice(above10, sym)})
          </button>
          <button
            type="button"
            className="cdr-btn cdr-btn--ghost cdr-btn--wide"
            disabled={price <= 0}
            onClick={() => onAdd(`-10 pip (${fmtPrice(below10, sym)})`)}
          >
            −10 pip ({fmtPrice(below10, sym)})
          </button>
          <button
            type="button"
            className="cdr-btn cdr-btn--ghost cdr-btn--wide"
            disabled={price <= 0}
            onClick={() => onAdd(`+25 pip (${fmtPrice(above25, sym)})`)}
          >
            +25 pip ({fmtPrice(above25, sym)})
          </button>
          <button
            type="button"
            className="cdr-btn cdr-btn--ghost cdr-btn--wide"
            disabled={price <= 0}
            onClick={() => onAdd(`-25 pip (${fmtPrice(below25, sym)})`)}
          >
            −25 pip ({fmtPrice(below25, sym)})
          </button>
        </div>

        {alerts.length === 0 ? (
          <p className="fx-alert-sheet__empty">Henüz alarm yok.</p>
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
