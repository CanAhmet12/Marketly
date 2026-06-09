"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

/** Studio alt sayfa başlığı — tipografi + yerleşim tutarlılığı */
export function StudioPageHead({ eyebrow, title, description, actions, className }: Props) {
  return (
    <header className={cn("st-page-head", className)}>
      <div className="st-page-head-main">
        {eyebrow ? <p className="st-page-eyebrow">{eyebrow}</p> : null}
        <h1 className="st-page-title">{title}</h1>
        {description ? <p className="st-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="st-page-head-actions">{actions}</div> : null}
    </header>
  );
}
