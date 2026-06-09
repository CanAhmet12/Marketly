import Link from "next/link";

import type { CloseFriendsHubPayload } from "@/features/close-friends/domain/types";

type Props = Pick<CloseFriendsHubPayload, "nav" | "publishing">;

export function CloseFriendsQuickLinks({ nav, publishing }: Props) {
  const links = [
    { href: nav.subscriptions, label: "Üyelikler" },
    { href: nav.messages, label: "Mesajlar" },
    { href: nav.notifications, label: "Bildirimler" },
    { href: nav.discover, label: "Keşfet" },
    { href: publishing.upload_href, label: "Yayınla" },
    { href: "/hub/settings", label: "Ayarlar" },
  ];

  return (
    <nav className="cf-quick-links" aria-label="İlgili sayfalar">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="cf-quick-link">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
