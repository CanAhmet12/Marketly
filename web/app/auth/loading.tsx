import { AuthFormSkeleton } from "@/features/auth/components/auth-states";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";

/** Auth route geçişleri — form kartı skeleton */
export default function AuthLoading() {
  return (
    <DelayedSkeleton>
      <div className="flex min-h-[50vh] items-center justify-center px-[var(--sp-3)]" role="status" aria-label="Sayfa yükleniyor">
        <AuthFormSkeleton />
      </div>
    </DelayedSkeleton>
  );
}
