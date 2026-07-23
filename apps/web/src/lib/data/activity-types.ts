import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type ActivityTypeRow =
  Database["public"]["Tables"]["activity_types"]["Row"];

export async function listActivityTypes(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_types")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
