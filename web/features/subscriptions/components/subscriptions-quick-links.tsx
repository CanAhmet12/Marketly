import Link from "next/link";

type Props = {
  nav: {
    signals: string;
    discover: string;
    watch: string;
    markets: string;
  };
};

export function SubscriptionsQuickLinks({ nav }: Props) {
  const links = [
    { href: nav.signals, label: "Sinyaller" },
    { href: nav.discover, label: "Keşfet" },
    { href: nav.watch, label: "İzle" },
    { href: nav.markets, label: "Piyasalar" },
    { href: "/hub/close-friends", label: "Özel daireler" },
  ];

  return (
    <nav className="sub-quick-links" aria-label="İlgili sayfalar">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="sub-quick-link">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
