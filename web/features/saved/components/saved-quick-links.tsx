import Link from "next/link";

const LINKS = [
  { href: "/discover", label: "Keşfet" },
  { href: "/watch", label: "İzle" },
  { href: "/hub/notifications", label: "Bildirimler" },
  { href: "/hub/subscriptions", label: "Abonelikler" },
  { href: "/hub/settings", label: "Ayarlar" },
];

export function SavedQuickLinks() {
  return (
    <nav className="sv-quick-links" aria-label="İlgili sayfalar">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className="sv-quick-link">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
