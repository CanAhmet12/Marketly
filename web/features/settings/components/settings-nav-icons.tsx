type IconProps = { className?: string };

const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function SettingsIconHesap(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function SettingsIconProfil(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function SettingsIconUyelik(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <path d="M12 2l2.4 4.8 5.4.8-3.9 3.8.9 5.3L12 14.8 7.2 16.7l.9-5.3L4.2 7.6l5.4-.8L12 2Z" />
    </svg>
  );
}

export function SettingsIconStudio(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9v6l5-3-5-3Z" />
    </svg>
  );
}

export function SettingsIconBildirim(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <path d="M15 17H9l-5 3V7a5 5 0 0 1 10 0v6" />
      <path d="M13.7 3.3A5 5 0 0 1 19 7v4" />
    </svg>
  );
}

export function SettingsIconGizlilik(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <path d="M12 3 4 7v6c0 5 3.5 8 8 8s8-3 8-8V7l-8-4Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function SettingsIconGorunum(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    </svg>
  );
}

export function SettingsIconGuvenlik(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function SettingsIconKisisel(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export function SettingsIconIlgi(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2Z" />
      <path d="M9 22h6" />
    </svg>
  );
}

export function SettingsIconVeri(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  );
}
