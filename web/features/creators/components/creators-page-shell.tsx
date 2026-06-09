"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Minimal sayfa kabuğu — başlık/sekme yok; ana + sağ rail grid içinde */
export function CreatorsPageShell({ children }: Props) {
  return (
    <div className="crt-v2-page ms-page-wrapper ms-page-wrapper--compact">
      <div className="ms-container-wide">
        <div className="crt-v2-layout" role="main">
          {children}
        </div>
      </div>
    </div>
  );
}
