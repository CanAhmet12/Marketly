import type { StoryRing } from "@/features/home/repository/types";

import type { HomeVisualStoryItem } from "../visual/mock-data";

const ADD_ITEM: HomeVisualStoryItem = {
  id: "__add_story__",
  label: "Hikaye Ekle",
  avatarUrl: "",
  variant: "default",
  ring: "slate",
};

function mapOne(r: StoryRing): HomeVisualStoryItem {
  const liveIds = new Set(["st-fed", "st-viop", "st-xu"]);
  const newIds = new Set(["st-earn", "st-ai", "st-etf"]);
  let variant: HomeVisualStoryItem["variant"] = "default";
  if (liveIds.has(r.id)) variant = "live";
  else if (newIds.has(r.id)) variant = "new";

  let ring: HomeVisualStoryItem["ring"] = "slate";
  if (r.id === "st-fed" || r.id === "st-btc" || r.id === "st-xu") ring = "teal";
  else if (r.id === "st-earn" || r.id === "st-ai" || r.id === "st-makro") ring = "amber";

  return {
    id: r.id,
    label: r.label,
    avatarUrl: r.thumbnail_url ?? "",
    variant,
    ring,
  };
}

export function mapStoryRailItems(rings: StoryRing[]): HomeVisualStoryItem[] {
  const mapped = rings.map(mapOne);
  return [ADD_ITEM, ...mapped];
}
