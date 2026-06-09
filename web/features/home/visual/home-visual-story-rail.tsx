import Image from "next/image";

import type { HomeVisualStoryItem } from "./mock-data";

const ROOT = "hv-ref-stories";
const ADD_STORY_ID = "__add_story__";

function storyRailClass(part: string): string {
  return part ? `${ROOT}${part}` : ROOT;
}

function isAddStoryItem(item: HomeVisualStoryItem): boolean {
  return item.id === ADD_STORY_ID || item.id === "s1";
}

type Props = {
  items: HomeVisualStoryItem[];
  onStoryPress?: (item: HomeVisualStoryItem) => void;
  onAddStory?: () => void;
};

export function HomeVisualStoryRail({ items, onStoryPress, onAddStory }: Props) {
  const hit = storyRailClass("__hit");
  const ring = storyRailClass("__ring");
  const badge = storyRailClass("__badge");
  const inner = storyRailClass("__inner");
  const plusWrap = storyRailClass("__plus-wrap");
  const plus = storyRailClass("__plus");
  const label = storyRailClass("__label");
  const liveDot = storyRailClass("__live-dot");

  return (
    <div className={ROOT} aria-label="Öne çıkanlar">
      {items.map((s) => {
        const isAdd = isAddStoryItem(s);
        const isLive = s.variant === "live" && !isAdd;
        return (
          <button
            key={s.id}
            type="button"
            className={hit}
            data-viewed={s.isViewed ? "true" : undefined}
            data-live={isLive ? "true" : undefined}
            onClick={() => {
              if (isAdd) onAddStory?.();
              else onStoryPress?.(s);
            }}
          >
            <div
              className={ring}
              data-tone={s.ring}
              data-add={isAdd ? "true" : undefined}
              data-variant={s.variant}
            >
              {isLive ? <span className={liveDot} aria-hidden /> : null}
              {s.variant === "live" ? (
                <span className={badge} data-kind="live">
                  Canlı
                </span>
              ) : s.variant === "new" ? (
                <span className={badge} data-kind="new">
                  Yeni
                </span>
              ) : null}
              <div className={inner}>
                {isAdd ? (
                  <span className={plusWrap}>
                    <span className={plus} aria-hidden>
                      +
                    </span>
                  </span>
                ) : (
                  <Image src={s.avatarUrl} alt="" width={52} height={52} sizes="52px" className="h-full w-full object-cover" />
                )}
              </div>
            </div>
            <div className={label}>{isAdd ? "Ekle" : s.label}</div>
          </button>
        );
      })}
    </div>
  );
}
