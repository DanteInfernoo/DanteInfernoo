import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type EmailTemplateRow =
  Database["public"]["Tables"]["email_templates"]["Row"];

export async function listEmailTemplates(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
