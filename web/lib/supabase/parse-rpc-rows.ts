/**
 * Supabase RPC yanıtlarını satır dizisine çevirir.
 * P1_002 JSONB döndüren RPC'ler ile TABLE dönen eski RPC'ler uyumlu.
 */
export function parseRpcRows<T>(data: unknown): T[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  if (typeof data === "object") {
    return Array.isArray(data) ? (data as T[]) : [];
  }
  return [];
}
