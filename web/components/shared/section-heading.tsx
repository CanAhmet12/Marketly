import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Kanal / panel bölüm başlığı — mevcut tipografi ile aynı. */
export function SectionHeading({ children, className = "" }: Props) {
  return (
    <h2
      className={`mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-muted)] ${className}`.trim()}
    >
      {children}
    </h2>
  );
}
