import Image from "next/image";

import type { HomeVisualStoryItem } from "./mock-data";

export type StoryRailVariant = "home" | "discover";

function storyRailClass(variant: StoryRailVariant, part: string): string {
  const root = variant === "discover" ? "dvr-stories" : "hv-ref-stories";
  return part ? `${root}${part}` : root;
}

type Props = {
  items: HomeVisualStoryItem[];
  onStoryPress?: (item: HomeVisualStoryItem) => void;
  onAddStory?: () => void;
  variant?: StoryRailVariant;
};

export function HomeVisualStoryRail({ items, onStoryPress, onAddStory, variant = "home" }: Props) {
  const root = storyRailClass(variant, "");
  const hit = storyRailClass(variant, "__hit");
  const ring = storyRailClass(variant, "__ring");
  const badge = storyRailClass(variant, "__badge");
  const inner = storyRailClass(variant, "__inner");
  const plusWrap = storyRailClass(variant, "__plus-wrap");
  const plus = storyRailClass(variant, "__plus");
  const label = storyRailClass(variant, "__label");

  return (
    <div className={root} aria-label="Öne çıkanlar">
      {items.map((s) => {
        const isAdd = s.id === "__add_story__" || s.id === "s1" || !s.avatarUrl;
        return (
          <button
            key={s.id}
            type="button"
            className={hit}
            data-viewed={s.isViewed ? "true" : undefined}
            onClick={() => {
              if (isAdd) onAddStory?.();
              else onStoryPress?.(s);
            }}
          >
            <div className={ring} data-tone={s.ring} data-add={isAdd ? "true" : undefined}>
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
            <div className={label}>{s.label}</div>
          </button>
        );
      })}
    </div>
  );
}
