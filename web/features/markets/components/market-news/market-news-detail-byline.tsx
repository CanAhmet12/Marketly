import {
  formatNewsPublishedAt,
  formatNewsTimeAgo,
} from "@/features/markets/lib/market-news-shared";

type Props = {
  source: string;
  minutesAgo: number;
  publishedAt?: string | null;
  readMinutes: number;
  sectorImpact?: string | null;
};

export function MarketNewsDetailByline({
  source,
  minutesAgo,
  publishedAt,
  readMinutes,
  sectorImpact,
}: Props) {
  const published = formatNewsPublishedAt(publishedAt);

  return (
    <div className="mnd-ch-byline" role="group" aria-label="Haber künyesi">
      <div className="mnd-ch-byline__primary">
        <span className="mnd-ch-byline__source">{source}</span>
        <span className="mnd-ch-byline__sep" aria-hidden>
          ·
        </span>
        <time className="mnd-ch-byline__time" title={published ?? undefined}>
          {formatNewsTimeAgo(minutesAgo)}
        </time>
        {published ? (
          <>
            <span className="mnd-ch-byline__sep" aria-hidden>
              ·
            </span>
            <span className="mnd-ch-byline__published">{published}</span>
          </>
        ) : null}
      </div>
      <div className="mnd-ch-byline__secondary">
        <span className="mnd-ch-byline__read">{readMinutes} dk okuma</span>
        {sectorImpact ? (
          <>
            <span className="mnd-ch-byline__sep" aria-hidden>
              ·
            </span>
            <span className="mnd-ch-byline__sector">{sectorImpact}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
