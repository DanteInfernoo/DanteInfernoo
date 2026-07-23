"use server";

import { revalidatePath } from "next/cache";
import { activityTypeSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type ActivityTypeFormState = { error: string | null };

export async function createActivityType(
  workspaceSlug: string,
  _prevState: ActivityTypeFormState,
  formData: FormData,
): Promise<ActivityTypeFormState> {
  const parsed = activityTypeSchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon") || "circle",
    color: formData.get("color") || "#6b7280",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const { error } = await supabase.from("activity_types").insert({
    workspace_id: workspace.id,
    name: parsed.data.name,
    icon: parsed.data.icon,
    color: parsed.data.color,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "An activity type with that name already exists"
          : error.message,
    };
  }

  revalidatePath(`/app/${workspaceSlug}/settings/activity-types`);
  return { error: null };
}

export async function deleteActivityType(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("activity_types").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/activity-types`);
}
