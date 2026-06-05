"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function SearchPageShell({ children }: Props) {
  return (
    <div className="sch-canvas dvr-surface ms-page-wrapper--no-top">
      <div className="ms-container-wide">
        <div className="sch-page creators-page" role="main">
          {children}
        </div>
      </div>
    </div>
  );
}
