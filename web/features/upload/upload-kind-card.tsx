type Props = {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
};

export function UploadKindCard({ active, onClick, title, subtitle }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col rounded-[var(--radius-lg)] border p-4 text-left transition ${
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-[var(--shadow-card-md)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40"
      }`}
    >
      <span className="text-sm font-bold text-[var(--color-text)]">{title}</span>
      <span className="mt-1 text-xs text-[var(--color-muted)]">{subtitle}</span>
    </button>
  );
}
