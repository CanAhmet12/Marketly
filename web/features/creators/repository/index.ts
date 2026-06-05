import { isMockDataEnabled } from "@/mock/config";

import type { CreatorsRepository } from "./creators-repository";
import { MockCreatorsRepository } from "./mock-creators-repository";
import { SupabaseCreatorsRepository } from "./supabase-creators-repository";

export type { CreatorsRepository } from "./creators-repository";

let mockSingleton: MockCreatorsRepository | null = null;
let supabaseSingleton: SupabaseCreatorsRepository | null = null;

export function getCreatorsRepository(): CreatorsRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockCreatorsRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseCreatorsRepository();
  return supabaseSingleton;
}
