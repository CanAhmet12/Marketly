import type { ReactElement } from "react";

type IconProps = { className?: string };

export function RegimeIconBull({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 18l4-6 4 3 5-8 3 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RegimeIconBear({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6l4 6 4-3 5 8 3-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RegimeIconChop({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 12h6M14 12h6M10 8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PanelIconWatchlist({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3.5 14.8 9l5.7.5-4.3 3.7 1.3 5.5L12 16.8 6.5 18.7l1.3-5.5L3.5 9.5 9.2 9 12 3.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function PanelIconNews({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M7 9h6M7 12h10M7 15h8" strokeLinecap="round" />
    </svg>
  );
}

export function PanelIconCalendar({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M8 3v4M16 3v4M3 11h18" strokeLinecap="round" />
    </svg>
  );
}

const SEGMENT_BADGE: Record<string, string> = {
  l1: "L1",
  defi: "DeFi",
  l2: "L2",
  ai: "AI",
  meme: "MEME",
  gaming: "GAME",
  stablecoin: "STBL",
  rwa: "RWA",
};

export function SegmentBadge({ id }: { id: string }) {
  const label = SEGMENT_BADGE[id] ?? id.slice(0, 4).toUpperCase();
  return <span className="cc-seg-badge">{label}</span>;
}

const CAL_TYPE_LABEL: Record<string, string> = {
  unlock: "UNLOCK",
  etf: "ETF",
  macro: "MAKRO",
  fork: "FORK",
  listing: "LISTE",
};

export function CalendarTypeBadge({ type }: { type: string }) {
  const label = CAL_TYPE_LABEL[type] ?? type.slice(0, 5).toUpperCase();
  return <span className={cnCalType(type)}>{label}</span>;
}

function cnCalType(type: string): string {
  return `cc-cal-type cc-cal-type--${type}`;
}

export function RegimeMark({ regime }: { regime: "bull" | "bear" | "chop" }): ReactElement {
  const Icon = regime === "bull" ? RegimeIconBull : regime === "bear" ? RegimeIconBear : RegimeIconChop;
  return (
    <span className={`cc-regime-mark cc-regime-mark--${regime}`} aria-hidden>
      <Icon className="cc-regime-mark__svg" />
    </span>
  );
}
