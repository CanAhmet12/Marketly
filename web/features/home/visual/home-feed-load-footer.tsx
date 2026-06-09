"use client";

type Props = {
  loading?: boolean;
  end?: boolean;
  postCount?: number;
};

export function HomeFeedLoadFooter({ loading, end, postCount }: Props) {
  if (loading) {
    return (
      <div className="hv-ref-feed-footer hv-ref-feed-footer--loading" aria-live="polite" aria-busy="true">
        <span className="hv-ref-feed-footer__dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className="hv-ref-feed-footer__label">Daha fazla gönderi yükleniyor</span>
      </div>
    );
  }

  if (end && (postCount ?? 0) > 0) {
    return (
      <div className="hv-ref-feed-footer hv-ref-feed-footer--end" role="status" aria-live="polite">
        <span className="hv-ref-feed-footer__line" aria-hidden />
        <span className="hv-ref-feed-footer__label">Güncel gönderilerin sonu</span>
        <span className="hv-ref-feed-footer__line" aria-hidden />
      </div>
    );
  }

  return null;
}
