"use server";

import { revalidatePath } from "next/cache";
import { labelSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type LabelFormState = { error: string | null };

export async function createLabel(
  workspaceSlug: string,
  _prevState: LabelFormState,
  formData: FormData,
): Promise<LabelFormState> {
  const parsed = labelSchema.safeParse({
    entity_type: formData.get("entity_type"),
    name: formData.get("name"),
    color: formData.get("color") || "#6b7280",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const { error } = await supabase.from("labels").insert({
    workspace_id: workspace.id,
    entity_type: parsed.data.entity_type,
    name: parsed.data.name,
    color: parsed.data.color,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "A label with that name already exists for this entity type"
          : error.message,
    };
  }

  revalidatePath(`/app/${workspaceSlug}/settings/labels`);
  return { error: null };
}

export async function deleteLabel(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("labels").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/labels`);
}

export async function attachLabel(
  workspaceSlug: string,
  entityType: string,
  entityId: string,
  formData: FormData,
) {
  const labelId = formData.get("label_id") as string;
  if (!labelId) return;

  const supabase = await createClient();
  await supabase
    .from("entity_labels")
    .upsert(
      { label_id: labelId, entity_type: entityType, entity_id: entityId },
      { onConflict: "label_id,entity_id" },
    );

  revalidatePath(`/app/${workspaceSlug}/${entityType}s/${entityId}`);
}

export async function detachLabel(
  workspaceSlug: string,
  entityType: string,
  entityId: string,
  labelId: string,
) {
  const supabase = await createClient();
  await supabase
    .from("entity_labels")
    .delete()
    .eq("label_id", labelId)
    .eq("entity_id", entityId);

  revalidatePath(`/app/${workspaceSlug}/${entityType}s/${entityId}`);
}
