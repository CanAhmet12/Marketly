import type { StorySlide } from "@/features/stories/types";
import { avatarUrl } from "@/lib/avatar-url";

const uploaded: StorySlide[] = [];

export function pushMockUploadedStory(userId: string, username: string, imageUrl: string): StorySlide {
  const slide: StorySlide = {
    id: `mock-upload-${Date.now()}`,
    userId,
    username,
    profileImage: avatarUrl(userId, username),
    mediaUrl: imageUrl,
    mediaType: "image",
    isViewed: false,
    label: "Sen",
  };
  uploaded.unshift(slide);
  return slide;
}

export function getMockUploadedStories(): StorySlide[] {
  return [...uploaded];
}
