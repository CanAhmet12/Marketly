import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function requestAccountDeletion(confirmText: string): Promise<{ deletedRecords?: number }> {
  const client = getSupabaseBrowserClient();
  const { data: sessionData } = await client.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    throw new Error("Oturum bulunamadı.");
  }

  const { url: baseUrl } = getSupabasePublicEnv();
  if (!baseUrl) {
    throw new Error("Supabase yapılandırması eksik.");
  }

  const response = await fetch(`${baseUrl}/functions/v1/delete-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ confirmText: confirmText.trim().toLowerCase() }),
  });

  const result = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    deletedRecords?: number;
  };

  if (!response.ok) {
    throw new Error(result.error ?? "Hesap silinemedi.");
  }

  return { deletedRecords: result.deletedRecords };
}
