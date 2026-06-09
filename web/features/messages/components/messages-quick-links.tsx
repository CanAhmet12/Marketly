import Link from "next/link";

type Props = { links: { href: string; label: string }[] };

export function MessagesQuickLinks({ links }: Props) {
  if (links.length === 0) return null;

  return (
    <nav className="msg-quick-links" aria-label="İlgili sayfalar">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="msg-quick-link">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
