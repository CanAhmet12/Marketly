/**
 * Sınıf adlarını birleştirir (koşullu segmentler için).
 * İleride `clsx` + `tailwind-merge` eklenebilir.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
