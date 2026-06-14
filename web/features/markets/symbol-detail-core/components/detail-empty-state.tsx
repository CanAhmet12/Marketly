"use client";

type Props = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

export function DetailEmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className="cdr-shell cdr-empty-state">
      <h1 className="cdr-empty-state__title">{title}</h1>
      <p className="cdr-empty-state__desc">{description}</p>
      <button type="button" className="cdr-btn cdr-btn--primary" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}
