import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type HubPageHeaderProps = {
  kicker: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

/** Portföy pf-header ile hizalı hub üst chrome */
export function HubPageHeader({ kicker, title, subtitle, actions, className }: HubPageHeaderProps) {
  return (
    <header className={cn("hp-header", className)}>
      <div className="hp-header-left">
        <span className="hp-kicker">{kicker}</span>
        <h1 className="hp-title">{title}</h1>
        {subtitle ? <p className="hp-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="hp-header-actions">{actions}</div> : null}
    </header>
  );
}
