"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { usePathname } from "next/navigation";

import { resolveHubZone, type HubZoneId } from "@/features/hub/lib/hub-zone";
import { cn } from "@/lib/cn";

export type HubPageShellProps = {
  /** Bölge — verilmezse pathname'den çözülür */
  zone?: HubZoneId;
  children: ReactNode;
  /** Sayfa özel canvas sınıfları (ör. pf-canvas, wl-page) */
  className?: string;
  /** İçerik alanı ek sınıfları */
  mainClassName?: string;
  /** Üst kicker + başlık + aksiyonlar */
  header?: ReactNode;
  /** Hero metrik şeridi veya özet bandı */
  hero?: ReactNode;
  /** false → sadece zone + ambient, header slot yok */
  withMainArea?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

/**
 * Hub premium sayfa kabuğu — zone ambient, layout iskeleti, portföy DNA.
 * Faz 0 altyapı; tüm /hub/* sayfaları bu kabuk üzerine inşa edilir.
 */
export function HubPageShell({
  zone: zoneProp,
  children,
  className,
  mainClassName,
  header,
  hero,
  withMainArea = true,
  ...rootProps
}: HubPageShellProps) {
  const pathname = usePathname() ?? "";
  const zone = zoneProp ?? resolveHubZone(pathname);

  const inner = (
    <>
      {header}
      {hero}
      <div className="hp-body">{children}</div>
    </>
  );

  return (
    <div className={cn("hp-canvas", className)} data-hub-zone={zone} {...rootProps}>
      {withMainArea ? (
        <div className={cn("hp-main-area ms-page-wrapper ms-container-markets min-w-0", mainClassName)}>
          {inner}
        </div>
      ) : (
        inner
      )}
    </div>
  );
}
