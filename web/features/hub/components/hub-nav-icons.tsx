import type { ReactElement } from "react";

type IconProps = { className?: string };

function svg(className: string | undefined, children: ReactElement) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      {children}
    </svg>
  );
}

export function HubIconOverview({ className }: IconProps) {
  return svg(className, <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />);
}

export function HubIconProfile({ className }: IconProps) {
  return svg(className, (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
    </>
  ));
}

export function HubIconSaved({ className }: IconProps) {
  return svg(className, <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />);
}

export function HubIconPortfolio({ className }: IconProps) {
  return svg(className, (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </>
  ));
}

export function HubIconWatchlist({ className }: IconProps) {
  return svg(className, <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2Z" strokeLinejoin="round" />);
}

export function HubIconAlerts({ className }: IconProps) {
  return svg(className, <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" strokeLinejoin="round" />);
}

export function HubIconMessages({ className }: IconProps) {
  return svg(className, <path d="M4 6h16v10H9l-5 4V6Z" strokeLinejoin="round" />);
}

export function HubIconNotifications({ className }: IconProps) {
  return svg(className, <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" strokeLinejoin="round" />);
}

export function HubIconSubscriptions({ className }: IconProps) {
  return svg(className, <path d="M4 8h16M4 12h10M4 16h14" strokeLinecap="round" />);
}

export function HubIconCloseFriends({ className }: IconProps) {
  return svg(className, (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
    </>
  ));
}

export function HubIconStudio({ className }: IconProps) {
  return svg(className, (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" />
    </>
  ));
}

export function HubIconUpload({ className }: IconProps) {
  return svg(className, <path d="M12 16V4m0 0 4 4m-4-4L8 8M4 20h16" strokeLinecap="round" strokeLinejoin="round" />);
}

export function HubIconSettings({ className }: IconProps) {
  return svg(className, (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </>
  ));
}

export function HubIconExternal({ className }: IconProps) {
  return svg(className, (
    <>
      <path d="M14 5h5v5M10 14 19 5M19 14v5H5V5h5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ));
}

export function HubIconHome({ className }: IconProps) {
  return svg(className, <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />);
}

export function HubIconBack({ className }: IconProps) {
  return svg(className, <path d="M11 19l-7-7 7-7M4 12h16" strokeLinecap="round" strokeLinejoin="round" />);
}

const ICON_BY_HREF: Record<string, (p: IconProps) => ReactElement> = {
  "/hub/profile": HubIconProfile,
  "/hub/saved": HubIconSaved,
  "/hub/portfolio": HubIconPortfolio,
  "/hub/watchlist": HubIconWatchlist,
  "/hub/price-alerts": HubIconAlerts,
  "/hub/messages": HubIconMessages,
  "/hub/notifications": HubIconNotifications,
  "/hub/subscriptions": HubIconSubscriptions,
  "/hub/close-friends": HubIconCloseFriends,
  "/hub/studio": HubIconStudio,
  "/hub/upload": HubIconUpload,
  "/hub/settings": HubIconSettings,
  "/": HubIconHome,
};

export function hubNavIcon(href: string, className?: string): ReactElement {
  const Icon = ICON_BY_HREF[href] ?? HubIconOverview;
  return <Icon className={className} />;
}
