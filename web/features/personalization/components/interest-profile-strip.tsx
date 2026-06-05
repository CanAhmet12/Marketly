"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";

import type { InterestIntelligenceSnapshot } from "../domain/personalization-types";

type Props = {
  intel: InterestIntelligenceSnapshot;
  /** "full" = ayarlar; "compact" = ana sayfa şeridi */
  variant?: "full" | "compact";
  /** Sağ şerit: alt çizgi yok */
  embedded?: boolean;
  /** Phase 1C — tek cümle + hafif tema; chip duvarı yok */
  railAmbient?: boolean;
};

function ChipRow({
  title,
  chips,
  compact,
}: {
  title: string;
  chips: InterestIntelligenceSnapshot["strongest"];
  compact: boolean;
}) {
  if (!chips.length) return null;
  return (
    <div className={cn("min-w-0", compact ? "mt-2" : "mt-3")}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{title}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <Link
            key={c.id}
            href={c.href}
            className="max-w-full truncate rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text)] transition-colors hover:border-[color-mix(in_srgb,var(--color-primary)_40%,var(--color-border))]"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function InterestProfileStrip({ intel, variant = "full", embedded = false, railAmbient = false }: Props) {
  const compact = variant === "compact";

  if (intel.coldStart) {
    if (railAmbient && compact) {
      return <p className="text-[13px] font-medium leading-relaxed text-[var(--color-text-secondary)]">{intel.subline}</p>;
    }
    return compact ? null : (
      <div className="pb-3 border-b border-[var(--color-divider)]">
        <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">{intel.subline}</p>
      </div>
    );
  }

  if (railAmbient && compact) {
    const bits = intel.marketThemes.slice(0, 2).map((m) => m.label);
    return (
      <div className="space-y-1.5">
        <p className="text-[13px] font-medium leading-relaxed text-[var(--color-text-secondary)]">{intel.subline}</p>
        {bits.length > 0 ? (
          <p className="text-[12px] font-medium text-[var(--color-primary)]">{bits.join(" · ")}</p>
        ) : null}
      </div>
    );
  }

  return (
    <section
      className={cn(
        embedded ? "" : "border-b border-[var(--color-divider)]",
        compact ? "pb-[var(--sp-2)]" : "pb-3",
      )}
    >
      <p className={cn("font-medium text-[var(--color-text-secondary)]", compact ? "text-[12px]" : "text-[13px]")}>
        {intel.subline}
      </p>

      {intel.marketThemes.length ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {intel.marketThemes.slice(0, compact ? 3 : 6).map((m) => (
            <span key={m.id} className="rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-text)] ring-1 ring-[var(--color-divider)]">
              {m.label}
            </span>
          ))}
        </div>
      ) : null}

      {!compact ? (
        <>
          <ChipRow title="İlgi alanları" chips={intel.strongest} compact={compact} />
          <ChipRow title="Yükselen" chips={intel.rising} compact={compact} />
        </>
      ) : null}
    </section>
  );
}
