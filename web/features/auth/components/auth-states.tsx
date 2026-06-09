"use client";

/** Auth form Suspense fallback */
export function AuthFormSkeleton() {
  return (
    <div className="auth-form-skeleton" aria-busy="true">
      <div className="auth-form-skeleton__bar motion-shimmer h-7 w-40" />
      <div className="auth-form-skeleton__bar motion-shimmer mt-6 h-10 w-full" />
      <div className="auth-form-skeleton__bar motion-shimmer mt-3 h-10 w-full" />
      <div className="auth-form-skeleton__bar motion-shimmer mt-4 h-11 w-full" />
    </div>
  );
}
