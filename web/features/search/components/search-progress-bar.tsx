"use client";

type Props = { active: boolean };

export function SearchProgressBar({ active }: Props) {
  if (!active) return null;
  return (
    <div className="sch-progress" aria-hidden>
      <div className="sch-progress__bar" />
    </div>
  );
}
