"use client";

type Props = {
  title: string;
  onMore?: () => void;
};

export function ChannelSectionHeader({ title, onMore }: Props) {
  return (
    <div className="ch-section-header">
      <span className="ch-section-title">{title}</span>
      {onMore ? (
        <button type="button" className="ch-section-more" onClick={onMore}>
          Tümünü gör →
        </button>
      ) : null}
    </div>
  );
}
