import Link from "next/link";

type Props = {
  title: string;
  subtitle: string | null;
  seeAllHref: string | null;
};

export function HomeSectionHeader({ title, subtitle, seeAllHref }: Props) {
  return (
    <div className="mb-[var(--sp-3)] flex flex-wrap items-end justify-between gap-[var(--sp-2)]">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold leading-tight tracking-[-0.02em] text-[var(--color-text)]">{title}</h2>
        {subtitle ? (
          <p className="mt-px text-[13px] font-semibold leading-snug text-[var(--color-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {seeAllHref ? (
        <Link
          href={seeAllHref}
          className="shrink-0 text-[13px] font-semibold text-[var(--color-primary-dark)] transition hover:underline"
        >
          Tümünü gör
        </Link>
      ) : null}
    </div>
  );
}
