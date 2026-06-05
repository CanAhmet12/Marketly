"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/studio",           label: "Genel Bakış",       end: true },
  { href: "/studio/analytics", label: "Analitik" },
  { href: "/studio/content",   label: "İçerik" },
  { href: "/studio/economy",   label: "Ekonomi" },
  { href: "/studio/live",      label: "Canlı Yayın" },
  { href: "/studio/scheduled", label: "Zamanlanmış" },
  { href: "/studio/drafts",    label: "Taslaklar" },
  { href: "/studio/playlists", label: "Oynatma Listeleri" },
];

export function StudioSubnav() {
  const pathname = usePathname();

  return (
    <nav className="studio-subnav" aria-label="Studio bölümleri">
      <div className="studio-subnav-inner">
        {LINKS.map((l) => {
          const active = l.end
            ? pathname === l.href
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
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
