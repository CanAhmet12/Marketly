import type { ReactElement } from "react";

type Props = { className?: string };

function ic(className: string | undefined, children: ReactElement) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      {children}
    </svg>
  );
}

export function UploadIconPost({ className }: Props) {
  return ic(className, (
    <>
      <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
    </>
  ));
}

export function UploadIconSignal({ className }: Props) {
  return ic(className, (
    <>
      <path d="M4 18l5-5 4 4 7-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ));
}

export function UploadIconVideo({ className }: Props) {
  return ic(className, (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="m10 10 5 2-5 2v-4Z" fill="currentColor" stroke="none" />
    </>
  ));
}

export function UploadIconPulse({ className }: Props) {
  return ic(className, (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 8h2M11 12h2M11 16h2" strokeLinecap="round" />
    </>
  ));
}

export function UploadIconLive({ className }: Props) {
  return ic(className, (
    <>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </>
  ));
}
