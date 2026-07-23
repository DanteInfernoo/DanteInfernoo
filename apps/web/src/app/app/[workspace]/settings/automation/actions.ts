"use server";

import { revalidatePath } from "next/cache";
import { automationRuleFormSchema, type Json } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type AutomationRuleFormState = { error: string | null };

export async function createAutomationRule(
  workspaceSlug: string,
  _prevState: AutomationRuleFormState,
  formData: FormData,
): Promise<AutomationRuleFormState> {
  const parsed = automationRuleFormSchema.safeParse({
    name: formData.get("name"),
    trigger_type: formData.get("trigger_type"),
    to_stage_id: formData.get("to_stage_id") || "",
    condition_operator: formData.get("condition_operator") || "",
    condition_value: formData.get("condition_value") || undefined,
    activity_type_id: formData.get("activity_type_id") || "",
    activity_subject: formData.get("activity_subject") || "",
    activity_due_in_days: formData.get("activity_due_in_days") || undefined,
    email_template_id: formData.get("email_template_id") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const d = parsed.data;

  const triggerConfig: Record<string, unknown> = {};
  if (d.trigger_type === "deal_stage_changed" && d.to_stage_id) {
    triggerConfig.to_stage_id = d.to_stage_id;
  }

  const conditions =
    d.condition_operator && d.condition_value !== undefined
      ? [{ field: "value", operator: d.condition_operator, value: d.condition_value }]
      : [];

  const actions: Record<string, unknown>[] = [];
  if (d.activity_type_id) {
    actions.push({
      type: "create_activity",
      type_id: d.activity_type_id,
      subject: d.activity_subject || "Follow up",
      due_in_days: d.activity_due_in_days ?? 1,
    });
  }
  if (d.email_template_id) {
    actions.push({ type: "send_email_log", template_id: d.email_template_id });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("automation_rules").insert({
    workspace_id: workspace.id,
    name: d.name,
    entity_type: "deal",
    trigger_type: d.trigger_type,
    trigger_config: triggerConfig as Json,
    conditions: conditions as Json,
    actions: actions as Json,
  });

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/settings/automation`);
  return { error: null };
}

export async function toggleAutomationRule(
  id: string,
  workspaceSlug: string,
  isActive: boolean,
) {
  const supabase = await createClient();
  await supabase
    .from("automation_rules")
    .update({ is_active: isActive })
    .eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/automation`);
}

export async function deleteAutomationRule(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("automation_rules").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/automation`);
}
