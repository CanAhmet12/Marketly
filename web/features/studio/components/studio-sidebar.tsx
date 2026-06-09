"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { STUDIO_NAV_GROUPS } from "@/features/studio/lib/studio-nav-config";
import { cn } from "@/lib/cn";

function isNavActive(pathname: string, href: string, end?: boolean): boolean {
  if (end) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudioSidebar() {
  const pathname = usePathname();

  return (
    <aside className="studio-sidebar" aria-label="Studio menüsü">
      <nav className="studio-sidebar-nav">
        {STUDIO_NAV_GROUPS.map((group) => (
          <div key={group.id} className="studio-sidebar-group">
            <div className="studio-sidebar-group-label">{group.label}</div>
            <ul className="studio-sidebar-list">
              {group.items.map((item) => {
                const active = isNavActive(pathname, item.href, item.end);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn("studio-sidebar-link", active && "studio-sidebar-link--active")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="studio-sidebar-foot">
        <Link href="/upload" className="studio-sidebar-upload">
          + Yeni İçerik
        </Link>
      </div>
    </aside>
  );
}
