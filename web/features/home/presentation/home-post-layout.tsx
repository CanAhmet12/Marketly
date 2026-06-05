"use client";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/cn";

type EditorialProps = {
  avatar: ReactNode;
  header: ReactNode;
  primary?: ReactNode;
  /** Medya / bağlantı önizlemesi — satırın tam genişliği (avatar sütununun altına da yayılır) */
  fullBleed?: ReactNode;
  /** Medya altı: alıntı, repost vb. */
  underMedia?: ReactNode;
  footer: ReactNode;
  className?: string;
};

/**
 * Home-only: Twitter-benzeri dar sütun yerine editoryal ızgara.
 * Medya `fullBleed` ile gövde genişliğine hizalanır; metin üstte avatar ile hizalı kalır.
 */
export function HomeEditorialPostGrid({ avatar, header, primary, fullBleed, underMedia, footer, className }: EditorialProps) {
  return (
    <div className={cn("ms-home-editorial-post w-full min-w-0", className)}>
      <div className="ms-home-editorial-post__top grid w-full min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] gap-x-2.5 gap-y-1 px-2 sm:grid-cols-[3.25rem_minmax(0,1fr)] sm:gap-x-3 sm:px-2.5">
        <div className="ms-home-editorial-post__avatar row-start-1 self-start pt-0.5">{avatar}</div>
        <div className="min-w-0">{header}</div>
        {primary ? <div className="col-span-2 min-w-0 pt-0.5 sm:col-span-1 sm:col-start-2">{primary}</div> : null}
      </div>
      {fullBleed ? <div className="ms-home-editorial-post__fullbleed mt-2.5 w-full min-w-0 sm:mt-3">{fullBleed}</div> : null}
      {underMedia ? (
        <div className="ms-home-editorial-post__under mt-2.5 grid w-full grid-cols-[2.75rem_minmax(0,1fr)] gap-x-2.5 px-2 sm:grid-cols-[3.25rem_minmax(0,1fr)] sm:gap-x-3 sm:px-2.5">
          <div className="hidden sm:block" aria-hidden />
          <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2">{underMedia}</div>
        </div>
      ) : null}
      <div className="ms-home-editorial-post__footer mt-2.5 grid w-full grid-cols-[2.75rem_minmax(0,1fr)] gap-x-2.5 px-2 pb-2 sm:grid-cols-[3.25rem_minmax(0,1fr)] sm:gap-x-3 sm:px-2.5 sm:pb-2.5 sm:mt-3">
        <div className="hidden sm:block" aria-hidden />
        <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2">{footer}</div>
      </div>
    </div>
  );
}

type CinematicProps = {
  stage: ReactNode;
  below: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Video / canlı / pulse Home: üst sahne tam genişlik, alt blok editoryal hizalı */
export function HomeCinematicPostShell({ stage, below, className, style }: CinematicProps) {
  return (
    <div className={cn("ms-home-cinematic-post w-full min-w-0 overflow-hidden rounded-2xl", className)} style={style}>
      <div className="ms-home-cinematic-post__stage overflow-hidden rounded-t-2xl ring-1 ring-[color-mix(in_srgb,var(--color-divider)_32%,transparent)]">{stage}</div>
      <div className="ms-home-cinematic-post__below border-t border-[color-mix(in_srgb,var(--color-divider)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-subtle)_35%,transparent)] px-2 pb-2 pt-2.5 sm:px-2.5 sm:pb-2.5 sm:pt-3">
        {below}
      </div>
    </div>
  );
}
