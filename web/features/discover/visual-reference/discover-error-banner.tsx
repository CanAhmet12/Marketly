"use client";

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function DiscoverErrorBanner({
  title = "Keşfet akışı yüklenemedi",
  message = "İçerik şu an görüntülenemiyor. Bağlantını kontrol edip tekrar dene.",
  onRetry,
}: Props) {
  return (
    <div className="dvr-error-banner" role="alert">
      <div className="dvr-error-banner__copy">
        <span className="dvr-error-banner__icon" aria-hidden />
        <div className="dvr-error-banner__text-wrap">
          <p className="dvr-error-banner__title">{title}</p>
          <p className="dvr-error-banner__text">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <button type="button" className="dvr-error-banner__retry" onClick={onRetry}>
          Tekrar dene
        </button>
      ) : null}
    </div>
  );
}
