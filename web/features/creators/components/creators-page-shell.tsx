"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function CreatorsPageShell({ children }: Props) {
  return (
    <div className="creators-page ms-page-wrapper ms-container-full min-w-0 max-w-full">
      <header className="creators-page__head">
        <div className="creators-page__head-row">
          <div className="creators-page__head-main">
            <Link href="/discover" className="creators-page__back">
              Keşfet
            </Link>
            <h1 className="creators-page__title">Üreticiler</h1>
          </div>
          <p className="creators-page__desc">Varlık ve format bazlı analist keşfi</p>
        </div>
      </header>
      {children}
    </div>
  );
}
