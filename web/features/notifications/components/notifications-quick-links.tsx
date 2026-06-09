import Link from "next/link";

import type { NotificationSurfaceLink } from "@/features/notifications/domain/types";

type Props = { links: NotificationSurfaceLink[] };

export function NotificationsQuickLinks({ links }: Props) {
  if (links.length === 0) return null;

  return (
    <nav className="ntf-quick-links" aria-label="İlgili sayfalar">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="ntf-quick-link">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
