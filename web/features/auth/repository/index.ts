import { isMockDataEnabled } from "@/mock/config";

import type { AuthRepository } from "./auth-repository";
import { MockAuthRepository } from "./mock-auth-repository";
import { SupabaseAuthRepository } from "./supabase-auth-repository";

export type { AuthRepository } from "./auth-repository";

let m: MockAuthRepository | null = null;
let s: SupabaseAuthRepository | null = null;

export function getAuthRepository(): AuthRepository {
  if (isMockDataEnabled()) {
    m ??= new MockAuthRepository();
    return m;
  }
  s ??= new SupabaseAuthRepository();
  return s;
}
