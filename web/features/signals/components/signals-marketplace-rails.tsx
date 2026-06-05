"use client";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { SignalDirectionPill } from "@/features/signals/components/unified-signal-primitives";
import { signalLifecycleLabel } from "@/features/signals/domain/signal-meta";
import { useMockSignalSubscriber } from "@/features/signals/hooks/use-mock-signal-subscriber";
import type { SignalsFeedRow, SignalsMarketplaceRail } from "@/features/signals/repository/types";
import { cn } from "@/lib/cn";

type Props = {
  rails: SignalsMarketplaceRail[];
  onOpen: (row: SignalsFeedRow) => void;
};

export function SignalsMarketplaceRails({ rails, onOpen }: Props) {
  const isSubscriber = useMockSignalSubscriber();
  if (!rails.length) return null;
  return (
    <div className="space-y-[var(--sp-5)]">
      {rails.map((rail) => (
        <section key={rail.id} className="min-w-0" aria-labelledby={`rail-${rail.id}`}>
          <div className="mb-[var(--sp-2)] flex min-w-0 flex-col gap-0.5 px-px min-[640px]:flex-row min-[640px]:items-end min-[640px]:justify-between">
            <div className="min-w-0">
              <h2 id={`rail-${rail.id}`} className="text-[13px] font-bold tracking-tight text-[var(--color-text)]">
                {rail.title}
              </h2>
              {rail.subtitle ? <p className="mt-0.5 text-[11px] font-medium leading-snug text-[var(--color-meta)]">{rail.subtitle}</p> : null}
            </div>
          </div>
          <div className="ms-rail-scroll -mx-[var(--sp-2)] flex min-w-0 gap-[var(--sp-2)] overflow-x-auto px-[var(--sp-2)] pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {rail.rows.map((row) => (
              <button
                key={`${rail.id}-${row.id}`}
                type="button"
                onClick={() => onOpen(row)}
                className="group relative flex w-[min(88vw,272px)] shrink-0 flex-col rounded-xl border border-[var(--ms-border-hairline)] bg-[var(--ms-card-surface)] p-[var(--sp-3)] text-left shadow-[var(--ms-shadow-1)] transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--ms-border-hairline))] active:scale-[0.99]"
              >
                {row.signal_access !== "public" ? (
                  <span
                    className={cn(
                      "pointer-events-none absolute right-2 top-2 rounded-md border px-1.5 py-px text-[9px] font-bold uppercase tracking-wide",
                      isSubscriber
                        ? "border-[var(--ms-border-hairline)] text-[var(--color-meta)]"
                        : "border-[color-mix(in_srgb,var(--color-primary)_28%,var(--ms-border-hairline))] bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] text-[var(--color-primary-dark)]",
                    )}
                  >
                    {isSubscriber ? "Üyelik" : "Kilit"}
                  </span>
                ) : null}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[16px] font-bold tabular-nums tracking-tight text-[var(--color-text)]">{row.symbol}</p>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-[var(--color-text-secondary)]">{row.asset_display_name}</p>
                  </div>
                  <SignalDirectionPill direction={row.direction} className="!py-px !text-[9px]" />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold tabular-nums text-[var(--color-text)]">%{row.confidence}</span>
                  <span className="truncate rounded-md bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-1.5 py-px text-[10px] font-semibold text-[var(--color-meta)]">
                    {signalLifecycleLabel(row.lifecycle_phase)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 border-t border-[var(--ms-border-hairline)] pt-2">
                  {row.analyst.avatar_url ? (
                    <SafeAvatar src={row.analyst.avatar_url} alt="" size={28} className="h-7 w-7 shrink-0 rounded-full ring-1 ring-[var(--ms-border-hairline)]" />
                  ) : (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-[11px] font-bold text-[var(--color-text)]">
                      {row.analyst.display.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <p className="min-w-0 truncate text-[11px] font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]">{row.analyst.display}</p>
                </div>
                <p className="mt-1.5 text-[10px] font-medium text-[var(--color-meta)]">
                  Kopya {row.community_copies_24h.toLocaleString("tr-TR")} · 24s
                </p>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
