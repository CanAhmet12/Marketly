import type { ReactNode } from "react";

type IconProps = { className?: string; size?: number };

function RailSvg({
  className,
  size = 16,
  children,
}: {
  className?: string;
  size?: number;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconRailCrypto({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 8h4.5a2 2 0 0 1 0 4H9v4" />
      <path d="M9 12h5" />
    </RailSvg>
  );
}

export function IconRailStocks({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M4 19h16" />
      <path d="M7 15l3-4 3 2 5-6" />
    </RailSvg>
  );
}

export function IconRailForex({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h8M12 8v8" />
      <path d="M8.5 9.5 6 7M15.5 14.5 18 17" />
    </RailSvg>
  );
}

export function IconRailSignals({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />
    </RailSvg>
  );
}

export function IconRailNews({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M4 5h12v14H4V5Z" />
      <path d="M16 9h4v10H8v-2" />
      <path d="M8 9h4M8 12h4" />
    </RailSvg>
  );
}

export function IconRailWatchlist({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M12 17.3 6.2 20l1.1-6.6L2 8.7l6.6-1L12 2l3.4 5.7 6.6 1-5.3 4.7 1.1 6.6L12 17.3Z" />
    </RailSvg>
  );
}

export function IconRailCreators({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </RailSvg>
  );
}

export function IconRailDiscuss({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M4 5h16v10H8l-4 4V5Z" />
      <path d="M8 10h8M8 13h5" />
    </RailSvg>
  );
}

export function IconRailInterest({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 3 8v5" />
    </RailSvg>
  );
}

export function IconRailMood({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 10h.01M15 10h.01" />
    </RailSvg>
  );
}

export function IconRailTrendUp({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="m3 17 6-6 4 4 7-7" />
      <path d="M14 8h6v6" />
    </RailSvg>
  );
}

export function IconRailTrendDown({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="m3 7 6 6 4-4 7 7" />
      <path d="M14 16h6v-6" />
    </RailSvg>
  );
}

export function IconRailTrendFlat({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M4 12h16" />
      <path d="M8 8v8M16 8v8" />
    </RailSvg>
  );
}

export function IconRailTrendMixed({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M4 14h5l2-4 3 6 3-4h3" />
    </RailSvg>
  );
}

export function IconRailLive({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="8" opacity="0.35" />
    </RailSvg>
  );
}

export function IconRailFlame({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M12 3c1 3 4 4.5 4 8a4 4 0 1 1-8 0c0-2 1.5-3.5 2.5-5.5.5 1.5 1 2.5 1.5 2.5Z" />
    </RailSvg>
  );
}

export function IconRailVerified({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M12 2l2.2 1.1 2.4-.3 1.1 2.2 2.2 1.1-.3 2.4 1.1 2.2-2.2 1.1-.3 2.4-2.4-.3-2.2 1.1-2.2-1.1-2.4.3-2.2-1.1L12 2Z" />
      <path d="m9 12 2 2 4-4" />
    </RailSvg>
  );
}

export function IconRailClock({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </RailSvg>
  );
}

export function IconRailBook({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
      <path d="M5 18h11" />
    </RailSvg>
  );
}

export function IconRailCopy({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </RailSvg>
  );
}

export function IconRailUser({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c0-3.5 3-5.5 7-5.5s7 2 7 5.5" />
    </RailSvg>
  );
}

export function IconRailChevronRight({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="m9 6 6 6-6 6" />
    </RailSvg>
  );
}

export function IconRailVolume({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M4 10v4h4l5 4V6L8 10H4Z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
    </RailSvg>
  );
}

export function IconRailSignalCount({ className, size }: IconProps) {
  return (
    <RailSvg className={className} size={size}>
      <path d="M4 12h4l2-6 4 12 2-6h4" />
    </RailSvg>
  );
}

const QUICK_FILTER_ICON_MAP = {
  crypto: IconRailCrypto,
  stocks: IconRailStocks,
  forex: IconRailForex,
  signals: IconRailSignals,
  news: IconRailNews,
} as const;

export function QuickFilterIcon({ id, className }: { id: string; className?: string }) {
  const Icon = QUICK_FILTER_ICON_MAP[id as keyof typeof QUICK_FILTER_ICON_MAP];
  if (!Icon) return null;
  return <Icon className={className} size={15} />;
}

export function MoodTrendIcon({
  mood,
  className,
}: {
  mood: "bullish" | "bearish" | "mixed" | "flat";
  className?: string;
}) {
  if (mood === "bullish") return <IconRailTrendUp className={className} size={14} />;
  if (mood === "bearish") return <IconRailTrendDown className={className} size={14} />;
  if (mood === "mixed") return <IconRailTrendMixed className={className} size={14} />;
  return <IconRailTrendFlat className={className} size={14} />;
}

export function PctTrendIcon({
  accent,
  className,
}: {
  accent?: "up" | "down" | "flat" | "neutral";
  className?: string;
}) {
  if (accent === "up") return <IconRailTrendUp className={className} size={13} />;
  if (accent === "down") return <IconRailTrendDown className={className} size={13} />;
  return <IconRailTrendFlat className={className} size={13} />;
}

export const RAIL_SECTION_ICONS = {
  crypto: IconRailCrypto,
  stocks: IconRailStocks,
  forex: IconRailForex,
  commodity: IconRailStocks,
  index: IconRailTrendUp,
  watchlist: IconRailWatchlist,
  news: IconRailNews,
  signals: IconRailSignals,
  discussions: IconRailDiscuss,
  creators: IconRailCreators,
  interests: IconRailInterest,
  mood: IconRailMood,
  movers: IconRailTrendMixed,
} as const;
