export type StoryMediaType = "image" | "video";

/** Tam ekran story viewer slaytı */
export type StorySlide = {
  id: string;
  userId: string;
  username: string;
  profileImage: string;
  mediaUrl: string;
  mediaType: StoryMediaType;
  isViewed: boolean;
  /** Şerit etiketi */
  label: string;
};

export type StoriesRailState = {
  slides: StorySlide[];
  loading: boolean;
};
