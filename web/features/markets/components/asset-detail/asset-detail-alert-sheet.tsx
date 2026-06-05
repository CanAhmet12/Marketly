"use client";

import { useEffect } from "react";

import type { MockAssetAlert } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  symbol: string;
  price: number;
  alerts: MockAssetAlert[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
};

export function AssetDetailAlertSheet({ open, onClose, symbol, price, alerts, onAdd, onRemove }: Props) {
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

  const above = (price * 1.02).toLocaleString("tr-TR", { maximumFractionDigits: price >= 100 ? 2 : 4 });
  const below = (price * 0.98).toLocaleString("tr-TR", { maximumFractionDigits: price >= 100 ? 2 : 4 });

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true" aria-label="Uyarılar">
      <button
        type="button"
        className="motion-backdrop-enter absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-colors duration-[var(--motion-fast)] hover:bg-black/48"
        aria-label="Kapat"
        onClick={onClose}
      />
      <aside className="motion-drawer-enter-right relative z-10 flex h-full w-full max-w-sm flex-col bg-[var(--color-surface)] shadow-xl">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-[var(--sp-3)] py-[var(--sp-3)]">
          <div>
            <p className="text-[11px] font-semibold uppercase text-[var(--color-meta)]">Fiyat uyarısı (mock)</p>
            <p className="text-[16px] font-bold text-[var(--color-text)]">{symbol}</p>
          </div>
          <button
            type="button"
            className="motion-active-press inline-flex h-10 min-w-10 items-center justify-center rounded-full px-[var(--sp-3)] text-[12px] font-bold text-[var(--color-text-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
            onClick={onClose}
          >
            Kapat
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-[var(--sp-3)] py-[var(--sp-3)]">
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">Hazır şablonlar — gerçek backend’de kural motoruna map edilir.</p>
          <div className="mt-[var(--sp-3)] flex flex-col gap-[var(--sp-2)]">
            <button type="button" className={presetBtn} onClick={() => onAdd(`Fiyat ≥ ${above}`)}>
              Fiyat ≥ {above}
            </button>
            <button type="button" className={presetBtn} onClick={() => onAdd(`Fiyat ≤ ${below}`)}>
              Fiyat ≤ {below}
            </button>
            <button type="button" className={presetBtn} onClick={() => onAdd("Gün içi %2 hareket")}>
              Gün içi %2 hareket
            </button>
            <button type="button" className={presetBtn} onClick={() => onAdd("Hacim anomalisi (mock)")}>
              Hacim anomalisi
            </button>
          </div>
          <h3 className="mb-[var(--sp-2)] mt-[var(--sp-4)] text-[11px] font-semibold uppercase text-[var(--color-meta)]">Kayıtlı</h3>
          <ul className="m-0 list-none space-y-2 p-0">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-[var(--sp-2)] rounded-lg border border-[var(--color-border)] px-[var(--sp-2)] py-[var(--sp-2)] text-[12px] font-semibold text-[var(--color-text)]">
                <span className="min-w-0">{a.label}</span>
                <button type="button" className="shrink-0 text-[11px] font-bold text-[var(--color-danger)] hover:underline" onClick={() => onRemove(a.id)}>
                  Kaldır
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

const presetBtn = cn(
  "motion-active-press rounded-lg border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] px-[var(--sp-3)] py-[var(--sp-2)] text-left text-[12px] font-bold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]",
);
