import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type PipelineRow = Database["public"]["Tables"]["pipelines"]["Row"];
export type StageRow = Database["public"]["Tables"]["stages"]["Row"];
export type PipelineWithStages = PipelineRow & { stages: StageRow[] };

export async function listPipelines(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPipelineWithStages(
  workspaceId: string,
  pipelineId: string,
): Promise<PipelineWithStages | null> {
  const supabase = await createClient();
  const { data: pipeline, error } = await supabase
    .from("pipelines")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("id", pipelineId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!pipeline) return null;

  const { data: stages, error: stagesError } = await supabase
    .from("stages")
    .select("*")
    .eq("pipeline_id", pipelineId)
    .order("sort_order", { ascending: true });

  if (stagesError) throw new Error(stagesError.message);

  return { ...pipeline, stages: stages ?? [] };
}

export async function getDefaultPipeline(workspaceId: string) {
  const pipelines = await listPipelines(workspaceId);
  return pipelines.find((p) => p.is_default) ?? pipelines[0] ?? null;
}
