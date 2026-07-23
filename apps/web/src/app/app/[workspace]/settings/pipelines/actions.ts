"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pipelineSchema, stageSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listPipelines } from "@/lib/data/pipelines";

export type SettingsFormState = { error: string | null };

export async function createPipeline(
  workspaceSlug: string,
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const parsed = pipelineSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const existing = await listPipelines(workspace.id);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pipelines")
    .insert({
      workspace_id: workspace.id,
      name: parsed.data.name,
      is_default: existing.length === 0,
      sort_order: existing.length,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/app/${workspaceSlug}/settings/pipelines/${data.id}`);
}

export async function setDefaultPipeline(
  workspaceSlug: string,
  pipelineId: string,
) {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return;

  const supabase = await createClient();
  await supabase
    .from("pipelines")
    .update({ is_default: false })
    .eq("workspace_id", workspace.id);
  await supabase
    .from("pipelines")
    .update({ is_default: true })
    .eq("id", pipelineId);

  revalidatePath(`/app/${workspaceSlug}/settings/pipelines`);
}

export async function deletePipeline(workspaceSlug: string, pipelineId: string) {
  const supabase = await createClient();
  await supabase.from("pipelines").delete().eq("id", pipelineId);
  redirect(`/app/${workspaceSlug}/settings/pipelines`);
}

export async function createStage(
  workspaceSlug: string,
  pipelineId: string,
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const parsed = stageSchema.safeParse({
    name: formData.get("name"),
    probability: formData.get("probability"),
    rotten_days: formData.get("rotten_days") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("stages")
    .select("id", { count: "exact", head: true })
    .eq("pipeline_id", pipelineId);

  const { error } = await supabase.from("stages").insert({
    pipeline_id: pipelineId,
    name: parsed.data.name,
    probability: parsed.data.probability,
    rotten_days: parsed.data.rotten_days ?? null,
    sort_order: count ?? 0,
  });

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/settings/pipelines/${pipelineId}`);
  return { error: null };
}

export async function deleteStage(
  workspaceSlug: string,
  pipelineId: string,
  stageId: string,
) {
  const supabase = await createClient();
  await supabase.from("stages").delete().eq("id", stageId);
  revalidatePath(`/app/${workspaceSlug}/settings/pipelines/${pipelineId}`);
}

export async function moveStage(
  workspaceSlug: string,
  pipelineId: string,
  stageId: string,
  direction: "up" | "down",
) {
  const supabase = await createClient();
  const { data: stages, error } = await supabase
    .from("stages")
    .select("id, sort_order")
    .eq("pipeline_id", pipelineId)
    .order("sort_order", { ascending: true });

  if (error || !stages) return;

  const index = stages.findIndex((s) => s.id === stageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= stages.length) return;

  const a = stages[index];
  const b = stages[swapIndex];

  await supabase.from("stages").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("stages").update({ sort_order: a.sort_order }).eq("id", b.id);

  revalidatePath(`/app/${workspaceSlug}/settings/pipelines/${pipelineId}`);
}
