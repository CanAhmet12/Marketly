/** Pulse oynatıcı SSR Suspense fallback. */

type Props = {
  onBack?: () => void;
};

export function PulsePlayerSkeleton({ onBack }: Props) {
  return (
    <div className="pulse-player pulse-player--loading" aria-busy="true">
      <div className="pulse-player__top">
        {onBack ? (
          <button type="button" className="pulse-player__back" onClick={onBack} aria-label="Geri">
            ←
          </button>
        ) : (
          <div className="pulse-player__back pulse-player__back--skeleton" aria-hidden />
        )}
        <span className="pulse-player__brand">Pulse</span>
      </div>
      <div className="pulse-player__skeleton" />
    </div>
  );
}
