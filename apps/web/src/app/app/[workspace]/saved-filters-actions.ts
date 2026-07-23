"use server";

import { revalidatePath } from "next/cache";
import { savedFilterSchema, type Json } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type SavedFilterFormState = { error: string | null };

export async function createSavedFilter(
  workspaceSlug: string,
  entityType: string,
  listPath: string,
  filterParams: Record<string, string>,
  _prevState: SavedFilterFormState,
  formData: FormData,
): Promise<SavedFilterFormState> {
  const parsed = savedFilterSchema.safeParse({
    entity_type: entityType,
    name: formData.get("name"),
    is_shared: formData.get("is_shared") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not signed in" };

  const { error } = await supabase.from("saved_filters").insert({
    workspace_id: workspace.id,
    owner_id: user.id,
    entity_type: parsed.data.entity_type,
    name: parsed.data.name,
    filter_params: filterParams as Json,
    is_shared: parsed.data.is_shared,
  });

  if (error) return { error: error.message };

  revalidatePath(listPath);
  return { error: null };
}

export async function deleteSavedFilter(id: string, listPath: string) {
  const supabase = await createClient();
  await supabase.from("saved_filters").delete().eq("id", id);
  revalidatePath(listPath);
}
