"use client";

type Props = {
  loading?: boolean;
  showEnd?: boolean;
};

export function DiscoverFeedFooter({ loading = false, showEnd = false }: Props) {
  if (loading) {
    return (
      <div className="dvr-feed-footer dvr-feed-footer--loading" aria-live="polite">
        <span className="dvr-feed-footer__dots" aria-hidden>
          <span className="dvr-feed-footer__dot" />
          <span className="dvr-feed-footer__dot" />
          <span className="dvr-feed-footer__dot" />
        </span>
        <p className="dvr-feed-footer__label">Daha fazla içerik yükleniyor</p>
      </div>
    );
  }

  if (!showEnd) return null;

  return (
    <div className="dvr-feed-footer dvr-feed-footer--end" aria-hidden>
      <span className="dvr-feed-footer__rule" />
      <p className="dvr-feed-footer__end-label">Keşfet akışının sonu</p>
    </div>
  );
}
