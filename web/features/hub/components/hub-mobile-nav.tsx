"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HUB_NAV_FLAT } from "@/features/hub/lib/hub-nav-config";
import { cn } from "@/lib/cn";

function isNavActive(pathname: string, href: string, end?: boolean): boolean {
  if (end) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Masaüstü sidebar gizliyken hub alt sayfalar arası geçiş */
export function HubMobileNav() {
  const pathname = usePathname() ?? "";
  const items = HUB_NAV_FLAT;

  return (
    <nav className="hb-mobile-nav" aria-label="Kanalım kısayolları">
      <div className="hb-mobile-nav-scroll">
        {items.map((item) => {
          const active = isNavActive(pathname, item.href, item.end);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn("hb-mobile-nav-link", active && "hb-mobile-nav-link--active")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
