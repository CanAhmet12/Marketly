"use client";

import { useEffect, useMemo, useState } from "react";

import type { MarketAssetView } from "@/features/markets/types";
import { PortfolioWriteGateNotice } from "@/features/markets/components/portfolio-write-gate-notice";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  assets: readonly MarketAssetView[];
  writeEnabled: boolean;
  pending: boolean;
  onSubmit: (input: { asset: MarketAssetView; quantity: number; avgCost: number }) => Promise<void>;
};

export function PortfolioAddHoldingSheet({ open, onClose, assets, writeEnabled, pending, onSubmit }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MarketAssetView | null>(null);
  const [quantity, setQuantity] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [err, setErr] = useState<string | null>(null);

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

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelected(null);
      setQuantity("");
      setAvgCost("");
      setErr(null);
    }
  }, [open]);

  useEffect(() => {
    if (selected && !avgCost) {
      setAvgCost(selected.price > 0 ? String(selected.price) : "");
    }
  }, [selected, avgCost]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return assets.slice(0, 12);
    return assets
      .filter(
        (a) =>
          a.symbol.toUpperCase().includes(q) ||
          a.name.toUpperCase().includes(q) ||
          a.id.toUpperCase().includes(q),
      )
      .slice(0, 16);
  }, [assets, query]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!writeEnabled) return;
    if (!selected) {
      setErr("Bir varlık seçin.");
      return;
    }
    const qty = parseFloat(quantity.replace(",", "."));
    const cost = parseFloat(avgCost.replace(",", "."));
    if (!Number.isFinite(qty) || qty <= 0) {
      setErr("Geçerli bir miktar girin.");
      return;
    }
    if (!Number.isFinite(cost) || cost <= 0) {
      setErr("Geçerli bir ortalama maliyet girin.");
      return;
    }
    setErr(null);
    try {
      await onSubmit({ asset: selected, quantity: qty, avgCost: cost });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Kayıt başarısız.");
    }
  };

  return (
    <div className="pf-add-sheet" role="dialog" aria-modal="true" aria-label="Pozisyon ekle">
      <button type="button" className="pf-add-sheet-backdrop" aria-label="Kapat" onClick={onClose} />
      <aside className="pf-add-sheet-panel">
        <header className="pf-add-sheet-header">
          <div>
            <p className="pf-add-sheet-eyebrow">Portföy</p>
            <h2 className="pf-add-sheet-title">Pozisyon Ekle</h2>
          </div>
          <button type="button" className="pf-add-sheet-close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="pf-add-sheet-body">
          {!writeEnabled ? <PortfolioWriteGateNotice /> : null}

          <label className="pf-add-sheet-field">
            <span className="pf-add-sheet-label">Varlık ara</span>
            <input
              type="search"
              className="pf-add-sheet-input"
              placeholder="BTC, THYAO, ETH…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </label>

          <ul className="pf-add-sheet-asset-list">
            {filtered.map((a) => {
              const on = selected?.id === a.id;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    className={cn("pf-add-sheet-asset", on && "pf-add-sheet-asset--active")}
                    onClick={() => setSelected(a)}
                  >
                    <span className="pf-add-sheet-asset-sym">{a.symbol}</span>
                    <span className="pf-add-sheet-asset-name">{a.name}</span>
                    <span className="pf-add-sheet-asset-price">
                      {a.price > 0 ? a.price.toLocaleString("en-US", { maximumFractionDigits: 4 }) : "—"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected ? (
            <div className="pf-add-sheet-form">
              <p className="pf-add-sheet-selected">
                Seçili: <strong>{selected.symbol}</strong> · {selected.name}
              </p>
              <label className="pf-add-sheet-field">
                <span className="pf-add-sheet-label">Miktar</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="pf-add-sheet-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                />
              </label>
              <label className="pf-add-sheet-field">
                <span className="pf-add-sheet-label">Ortalama maliyet</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="pf-add-sheet-input"
                  value={avgCost}
                  onChange={(e) => setAvgCost(e.target.value)}
                  placeholder="0.00"
                />
              </label>
            </div>
          ) : null}

          {err ? <p className="pf-add-sheet-error">{err}</p> : null}
        </div>

        <footer className="pf-add-sheet-footer">
          <button type="button" className="pf-add-sheet-btn pf-add-sheet-btn--ghost" onClick={onClose}>
            İptal
          </button>
          <button
            type="button"
            className="pf-add-sheet-btn pf-add-sheet-btn--primary"
            disabled={!writeEnabled || pending || !selected}
            onClick={() => void handleSubmit()}
          >
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </footer>
      </aside>
    </div>
  );
}
