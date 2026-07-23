"use server";

import { revalidatePath } from "next/cache";
import { goalSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type GoalFormState = { error: string | null };

export async function createGoal(
  workspaceSlug: string,
  _prevState: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  const parsed = goalSchema.safeParse({
    user_id: formData.get("user_id") || "",
    metric_type: formData.get("metric_type"),
    period: formData.get("period"),
    target_value: formData.get("target_value"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const { error } = await supabase.from("goals").insert({
    workspace_id: workspace.id,
    user_id: parsed.data.user_id || null,
    metric_type: parsed.data.metric_type,
    period: parsed.data.period,
    target_value: parsed.data.target_value,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "A goal for that metric/period/user already exists"
          : error.message,
    };
  }

  revalidatePath(`/app/${workspaceSlug}/settings/goals`);
  revalidatePath(`/app/${workspaceSlug}/dashboard`);
  return { error: null };
}

export async function deleteGoal(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("goals").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/goals`);
  revalidatePath(`/app/${workspaceSlug}/dashboard`);
}
