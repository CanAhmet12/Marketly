import { MOCK_APP_VIEWER_PROFILE_ID } from "@/mock/authentication/bootstrap";

/**
 * Mock takip listesi — mobil `follows` + `usePosts(feedMode: 'following')` davranışını taklit eder.
 * `viewerId` kendi profilinde kendini takip etmez.
 */
const DEFAULT_FOLLOWING = [
  "mock-profile-01",
  "mock-profile-02",
  "mock-profile-03",
  "mock-profile-05",
  "mock-profile-06",
  "mock-profile-07",
  "mock-profile-08",
  "mock-profile-09",
  "mock-profile-10",
  "mock-profile-11",
  "mock-profile-12",
  "mock-profile-14",
  "mock-profile-15",
  "mock-profile-16",
  "mock-profile-17",
  "mock-profile-18",
] as const;

export function getMockFollowingCreatorIds(viewerId: string | null | undefined): string[] {
  const self = viewerId?.trim() || MOCK_APP_VIEWER_PROFILE_ID;
  return DEFAULT_FOLLOWING.filter((id) => id !== self);
}
