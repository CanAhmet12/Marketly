import { getSocialRepository } from "@/features/social/repository";
import type { CreatorCommunityRoomsSurface } from "@/features/social/repository/creator-room-types";

/** Kanal topluluk odaları — SocialRepository (mock + live stub). */
export function fetchChannelRooms(channelUserId: string): CreatorCommunityRoomsSurface {
  return getSocialRepository().getCreatorCommunityRoomsSurface(channelUserId);
}
