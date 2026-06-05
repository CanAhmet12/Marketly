import type { ReactNode } from "react";

type Tone = "warning" | "danger";

const toneClass: Record<Tone, string> = {
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  danger: "border-red-200 bg-red-50 text-red-900",
};

type Props = {
  tone: Tone;
  title?: ReactNode;
  children: ReactNode;
  primaryAction?: { label: string; onClick: () => void };
};

/** Yapılandırma / yükleme hatası kutuları — sınıflar mevcut sayfalarla uyumlu. */
export function AlertCallout({ tone, title, children, primaryAction }: Props) {
  return (
    <div className={`rounded-[var(--radius-lg)] border p-4 text-sm ${toneClass[tone]}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : ""}>{children}</div>
      {primaryAction ? (
        <button
          type="button"
          className="mt-3 rounded-lg bg-[var(--color-danger)] px-4 py-2 font-semibold text-white"
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </button>
      ) : null}
    </div>
  );
}
