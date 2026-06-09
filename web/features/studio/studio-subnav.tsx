"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { STUDIO_NAV_FLAT } from "@/features/studio/lib/studio-nav-config";
import {
  mapStudioBaseHref,
  isStudioRouteActive,
  STUDIO_DEFAULT_BASE,
} from "@/features/studio/lib/studio-route-base";
import { cn } from "@/lib/cn";

type Props = {
  routeBase?: string;
};

export function StudioSubnav({ routeBase = STUDIO_DEFAULT_BASE }: Props) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="studio-subnav studio-subnav--mobile" aria-label="Studio bölümleri">
      <div className="studio-subnav-inner">
        {STUDIO_NAV_FLAT.map((l) => {
          const href = mapStudioBaseHref(l.href, routeBase);
          const active = isStudioRouteActive(pathname, l.href, routeBase, l.end);
          return (
            <Link
              key={l.href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn("studio-tab", active && "studio-tab--active")}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
