"use client";

import { useEffect, useMemo } from "react";

import type { MockAssetAlert } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { formatBistTickerPrice } from "@/features/markets/bist/lib/map-bist-tickers";
import {
  bistDisplayLabel,
  isBistIndexSymbol,
  normalizeBistSymbol,
} from "@/features/markets/bist/lib/bist-symbol-meta";

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
  return formatBistTickerPrice(price, symbol);
}

function tlStep(price: number): number {
  if (price >= 500) return 25;
  if (price >= 100) return 5;
  if (price >= 20) return 2;
  return 1;
}

export function BistDetailAlertSheet({
  open,
  onClose,
  symbol,
  price,
  alerts,
  onAdd,
  onRemove,
}: Props) {
  const sym = normalizeBistSymbol(symbol);
  const display = bistDisplayLabel(sym);
  const isIndex = isBistIndexSymbol(sym);
  const unit = isIndex ? "puan" : "TL";

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

  const presets = useMemo(() => {
    const above2 = price * 1.02;
    const below2 = price * 0.98;
    const above5 = price * 1.05;
    const below5 = price * 0.95;
    const pct = [
      { label: `+%2 (${fmtPrice(above2, sym)})`, value: `+%2 (${fmtPrice(above2, sym)})` },
      { label: `−%2 (${fmtPrice(below2, sym)})`, value: `−%2 (${fmtPrice(below2, sym)})` },
      { label: `+%5 (${fmtPrice(above5, sym)})`, value: `+%5 (${fmtPrice(above5, sym)})` },
      { label: `−%5 (${fmtPrice(below5, sym)})`, value: `−%5 (${fmtPrice(below5, sym)})` },
    ];

    if (isIndex || price <= 0) return { pct, tl: [] as { label: string; value: string }[] };

    const step = tlStep(price);
    const aboveTl = price + step;
    const belowTl = Math.max(0.01, price - step);

    return {
      pct,
      tl: [
        { label: `+${step} ${unit} (${fmtPrice(aboveTl, sym)})`, value: `+${step} ${unit} (${fmtPrice(aboveTl, sym)})` },
        { label: `−${step} ${unit} (${fmtPrice(belowTl, sym)})`, value: `−${step} ${unit} (${fmtPrice(belowTl, sym)})` },
      ],
    };
  }, [isIndex, price, sym, unit]);

  if (!open) return null;

  const spot = price > 0 ? fmtPrice(price, sym) : "—";

  return (
    <div className="cdr-alert-sheet" role="dialog" aria-modal="true" aria-label="Fiyat alarmları">
      <button type="button" className="cdr-alert-sheet__backdrop" aria-label="Kapat" onClick={onClose} />
      <aside className="cdr-alert-sheet__panel">
        <div className="bc-alert-sheet__head">
          <p className="cdr-alert-sheet__title">Fiyat alarmı</p>
          <button type="button" className="bc-alert-sheet__close" aria-label="Kapat" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="cdr-alert-sheet__sym">
          {display} ({sym}) · BIST
        </p>
        <p className="bc-alert-sheet__spot">
          Canlı: <strong>{spot}</strong> {unit}
        </p>

        <p className="bc-alert-sheet__group-label">Yüzde</p>
        <div className="bc-alert-sheet__presets">
          {presets.pct.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className="cdr-btn cdr-btn--ghost cdr-btn--wide"
              disabled={price <= 0}
              onClick={() => onAdd(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {presets.tl.length > 0 ? (
          <>
            <p className="bc-alert-sheet__group-label">TL adım</p>
            <div className="bc-alert-sheet__presets">
              {presets.tl.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className="cdr-btn cdr-btn--ghost cdr-btn--wide"
                  disabled={price <= 0}
                  onClick={() => onAdd(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {alerts.length === 0 ? (
          <p className="bc-alert-sheet__empty">Henüz alarm yok.</p>
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
