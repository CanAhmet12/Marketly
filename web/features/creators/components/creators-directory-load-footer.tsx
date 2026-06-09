"use client";

type Props = {
  loading: boolean;
  hasMore: boolean;
  shown: number;
  total: number;
  onLoadMore: () => void;
};

/** Dizin grid — sayfalı yükleme alt bilgisi */
export function CreatorsDirectoryLoadFooter({ loading, hasMore, shown, total, onLoadMore }: Props) {
  if (total === 0) return null;

  return (
    <div className="creators-directory-load-footer">
      <p className="creators-directory-load-footer__meta tabular-nums">
        {shown} / {total} üretici gösteriliyor
      </p>
      {hasMore ? (
        <button
          type="button"
          className="creators-directory-load-footer__btn"
          disabled={loading}
          onClick={onLoadMore}
        >
          {loading ? "Yükleniyor…" : "Daha fazla göster"}
        </button>
      ) : (
        <p className="creators-directory-load-footer__end">Listenin sonu</p>
      )}
    </div>
  );
}
