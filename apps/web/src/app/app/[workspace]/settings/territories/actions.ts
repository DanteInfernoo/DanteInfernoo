"use server";

import { revalidatePath } from "next/cache";
import { territorySchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type TerritoryFormState = { error: string | null };

export async function createTerritory(
  workspaceSlug: string,
  _prevState: TerritoryFormState,
  formData: FormData,
): Promise<TerritoryFormState> {
  const parsed = territorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const { error } = await supabase.from("territories").insert({
    workspace_id: workspace.id,
    name: parsed.data.name,
  });

  if (error) {
    return {
      error: error.code === "23505" ? "That territory already exists" : error.message,
    };
  }

  revalidatePath(`/app/${workspaceSlug}/settings/territories`);
  return { error: null };
}

export async function deleteTerritory(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("territories").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/territories`);
}
