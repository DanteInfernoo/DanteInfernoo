import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type AutomationRuleRow =
  Database["public"]["Tables"]["automation_rules"]["Row"];

export async function listAutomationRules(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("automation_rules")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
