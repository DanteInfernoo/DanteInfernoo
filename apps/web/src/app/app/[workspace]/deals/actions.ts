"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dealSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { parseCustomFieldsFromFormData } from "@/lib/custom-fields";

export type DealFormState = { error: string | null };

function readDealFields(formData: FormData) {
  return dealSchema.safeParse({
    title: formData.get("title"),
    value: formData.get("value") || 0,
    currency: formData.get("currency") || "USD",
    organization_id: formData.get("organization_id") || "",
    person_id: formData.get("person_id") || "",
    expected_close_date: formData.get("expected_close_date") || "",
  });
}

export async function createDeal(
  workspaceSlug: string,
  pipelineId: string,
  stageId: string,
  _prevState: DealFormState,
  formData: FormData,
): Promise<DealFormState> {
  const parsed = readDealFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const fieldDefs = await getFieldDefinitionsForEntity(workspace.id, "deal");
  const customFields = parseCustomFieldsFromFormData(formData, fieldDefs);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("deals")
    .insert({
      workspace_id: workspace.id,
      pipeline_id: pipelineId,
      stage_id: stageId,
      title: parsed.data.title,
      value: parsed.data.value,
      currency: parsed.data.currency,
      organization_id: parsed.data.organization_id || null,
      person_id: parsed.data.person_id || null,
      owner_id: user?.id,
      expected_close_date: parsed.data.expected_close_date || null,
      custom_fields: customFields,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/app/${workspaceSlug}/deals/${data.id}`);
}

export async function updateDeal(
  workspaceSlug: string,
  dealId: string,
  _prevState: DealFormState,
  formData: FormData,
): Promise<DealFormState> {
  const parsed = readDealFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const fieldDefs = await getFieldDefinitionsForEntity(workspace.id, "deal");
  const customFields = parseCustomFieldsFromFormData(formData, fieldDefs);

  const supabase = await createClient();
  const { error } = await supabase
    .from("deals")
    .update({
      title: parsed.data.title,
      value: parsed.data.value,
      currency: parsed.data.currency,
      organization_id: parsed.data.organization_id || null,
      person_id: parsed.data.person_id || null,
      expected_close_date: parsed.data.expected_close_date || null,
      custom_fields: customFields,
    })
    .eq("id", dealId);

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/deals/${dealId}`);
  return { error: null };
}

export async function deleteDeal(workspaceSlug: string, dealId: string) {
  const supabase = await createClient();
  await supabase.from("deals").delete().eq("id", dealId);
  redirect(`/app/${workspaceSlug}/deals`);
}

async function runAutomations(
  workspaceId: string,
  dealId: string,
  eventType: "deal_stage_changed" | "deal_won" | "deal_lost",
) {
  const supabase = await createClient();
  await supabase.rpc("run_automations", {
    p_workspace_id: workspaceId,
    p_entity_type: "deal",
    p_entity_id: dealId,
    p_event_type: eventType,
  });
}

export async function updateDealStage(
  workspaceSlug: string,
  dealId: string,
  stageId: string,
) {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  const supabase = await createClient();
  const { error } = await supabase
    .from("deals")
    .update({ stage_id: stageId })
    .eq("id", dealId);

  if (error) throw new Error(error.message);

  if (workspace) await runAutomations(workspace.id, dealId, "deal_stage_changed");

  revalidatePath(`/app/${workspaceSlug}/deals`);
}

export async function markDealWon(workspaceSlug: string, dealId: string) {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  const supabase = await createClient();
  await supabase.from("deals").update({ status: "won" }).eq("id", dealId);
  if (workspace) await runAutomations(workspace.id, dealId, "deal_won");
  revalidatePath(`/app/${workspaceSlug}/deals`);
  revalidatePath(`/app/${workspaceSlug}/deals/${dealId}`);
}

export async function markDealLost(
  workspaceSlug: string,
  dealId: string,
  formData: FormData,
) {
  const reason = (formData.get("lost_reason") as string) || null;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  const supabase = await createClient();
  await supabase
    .from("deals")
    .update({ status: "lost", lost_reason: reason })
    .eq("id", dealId);
  if (workspace) await runAutomations(workspace.id, dealId, "deal_lost");
  revalidatePath(`/app/${workspaceSlug}/deals`);
  revalidatePath(`/app/${workspaceSlug}/deals/${dealId}`);
}

export async function reopenDeal(workspaceSlug: string, dealId: string) {
  const supabase = await createClient();
  await supabase.from("deals").update({ status: "open" }).eq("id", dealId);
  revalidatePath(`/app/${workspaceSlug}/deals`);
  revalidatePath(`/app/${workspaceSlug}/deals/${dealId}`);
}
