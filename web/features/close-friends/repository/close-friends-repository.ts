import type {
  CloseFriendsHubPayload,
  ComposerCircleAudienceOption,
  PrivateCircleDetailPayload,
} from "../domain/types";

export type CloseFriendsRepository = {
  getPrivateCirclesHub(viewerId: string | null): CloseFriendsHubPayload;
  getCircleDetail(circleId: string, viewerId: string | null): PrivateCircleDetailPayload | null;
  /** Yayın akışı — üretici özel daire seçimi */
  getComposerCircleAudiences(publisherUserId: string): ComposerCircleAudienceOption[];
};
