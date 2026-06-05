"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  title: string;
  description?: string;
  headerAside?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
};

/** Varlık / pazar intelligence blokları — ortak başlık, ritim, düşük gürültü */
export function MarketIntelSection({ title, description, headerAside, children, className, bodyClassName, id }: Props) {
  return (
    <section id={id} className={cn("min-w-0 overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)]", className)}>
      <div className="border-b border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] px-[var(--sp-3)] py-[var(--sp-3)]">
        <div className="flex flex-col gap-[var(--sp-2)] min-[720px]:flex-row min-[720px]:items-end min-[720px]:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-meta)]">{title}</h2>
            {description ? <p className="mt-1 max-w-[52rem] text-[12px] font-medium leading-relaxed text-[var(--color-text-secondary)]">{description}</p> : null}
          </div>
          {headerAside ? <div className="min-w-0 shrink-0">{headerAside}</div> : null}
        </div>
      </div>
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </section>
  );
}
