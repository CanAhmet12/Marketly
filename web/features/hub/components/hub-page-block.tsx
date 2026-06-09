import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

export type HubPageBlockProps = {
  title: string;
  children: ReactNode;
  /** Stripe rengi — varsayılan zone accent */
  accent?: string;
  linkHref?: string;
  linkLabel?: string;
  className?: string;
  bodyClassName?: string;
  flushTop?: boolean;
};

/** Portföy pf-block ile hizalı içerik kartı */
export function HubPageBlock({
  title,
  children,
  accent,
  linkHref,
  linkLabel,
  className,
  bodyClassName,
  flushTop = true,
}: HubPageBlockProps) {
  const style = accent ? ({ "--hp-block-accent": accent } as CSSProperties) : undefined;

  return (
    <section
      className={cn("hp-block", "hp-block--section", className)}
      data-hp-block-accent="zone"
      style={style}
    >
      <div className="hp-block-header">
        <div className="hp-block-title-row">
          <span className="hp-block-stripe" aria-hidden />
          <h2 className="hp-block-title">{title}</h2>
        </div>
        {linkHref && linkLabel ? (
          <Link href={linkHref} className="hp-block-link">
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <div className={cn("hp-block-body", flushTop && "hp-block-body--flush-top", bodyClassName)}>{children}</div>
    </section>
  );
}
