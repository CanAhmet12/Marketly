"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  actions?: ReactNode;
};

/** v3 unified feed — bölüm başlığı (kart header yerine rule + tipografi) */
export function CryptoDetailZoneHead({ id, title, subtitle, href, linkLabel, actions }: Props) {
  return (
    <div className="cd-zone-head">
      <div className="cd-zone-head-main">
        {id ? (
          <h2 id={id} className="cd-zone-title">
            {title}
          </h2>
        ) : (
          <h2 className="cd-zone-title">{title}</h2>
        )}
        {subtitle ? <p className="cd-zone-sub">{subtitle}</p> : null}
      </div>
      {actions ?? null}
      {!actions && href && linkLabel ? (
        <Link href={href} className="cd-zone-link">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
