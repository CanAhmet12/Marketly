/** Mobil `lib/avatarUrl.ts` ile aynı mantık — deterministik fallback. */
const PALETTE = [
  "4F46E5",
  "0EA5E9",
  "10B981",
  "F59E0B",
  "EF4444",
  "8B5CF6",
  "EC4899",
  "14B8A6",
  "F97316",
  "6366F1",
  "84CC16",
  "06B6D4",
];

export function avatarUrl(userId: string, displayName?: string): string {
  const color = PALETTE[userId.charCodeAt(0) % PALETTE.length];
  const letter = (displayName?.charAt(0) ?? userId.charAt(0)).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(letter)}&background=${color}&color=fff&size=128&bold=true`;
}
