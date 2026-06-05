import { isMockDataEnabled } from "@/mock/config";

import type { MessagesRepository } from "./messages-repository";
import { MockMessagesRepository } from "./mock-messages-repository";
import { SupabaseMessagesRepository } from "./supabase-messages-repository";

export type { MessagesRepository } from "./messages-repository";

let mockSingleton: MockMessagesRepository | null = null;
let supaSingleton: SupabaseMessagesRepository | null = null;

export function getMessagesRepository(): MessagesRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockMessagesRepository();
    return mockSingleton;
  }
  supaSingleton ??= new SupabaseMessagesRepository();
  return supaSingleton;
}
