import type { MockPostSource } from "@/mock/fixtures/posts";
import { MOCK_POST_BY_ID } from "@/mock/fixtures/posts";

import { getMockCreatedPosts } from "./upload-store";

/** Gönderi kaynağı — sabit fixture + mock modda oluşturulan gönderiler */
export function resolveMockPostSourceById(id: string): MockPostSource | null {
  const fromFixture = MOCK_POST_BY_ID[id];
  if (fromFixture) return fromFixture;
  return getMockCreatedPosts().find((p) => p.id === id) ?? null;
}
