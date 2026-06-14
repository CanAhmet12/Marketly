"use client";

type Props = { active: boolean };

export function SearchProgressBar({ active }: Props) {
  if (!active) return null;
  return (
    <div className="srch-progress" aria-hidden>
      <div className="srch-progress__bar" />
    </div>
  );
}
