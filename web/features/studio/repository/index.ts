import { isMockDataEnabled } from "@/mock/config";

import { MockStudioRepository } from "./mock-studio-repository";
import type { StudioRepository } from "./studio-repository";
import { SupabaseStudioRepository } from "./supabase-studio-repository";

export type { StudioRepository } from "./studio-repository";
export * from "./types";
export { STUDIO_QUICK_ACTIONS } from "./studio-quick-actions";

let mockSingleton: MockStudioRepository | null = null;
let supabaseSingleton: SupabaseStudioRepository | null = null;

export function getStudioRepository(): StudioRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockStudioRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseStudioRepository();
  return supabaseSingleton;
}
