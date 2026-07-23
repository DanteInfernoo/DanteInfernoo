"use server";

import { revalidatePath } from "next/cache";
import { customFieldDefinitionSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type FieldFormState = { error: string | null };

function parseOptions(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label) => ({
      value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
      label,
    }));
}

export async function createFieldDefinition(
  workspaceSlug: string,
  _prevState: FieldFormState,
  formData: FormData,
): Promise<FieldFormState> {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    return { error: "Workspace not found" };
  }

  const fieldType = formData.get("field_type");
  const optionsRaw = formData.get("options_raw");

  const parsed = customFieldDefinitionSchema.safeParse({
    entity_type: formData.get("entity_type"),
    key: formData.get("key"),
    label: formData.get("label"),
    field_type: fieldType,
    options:
      (fieldType === "dropdown" || fieldType === "multiselect") &&
      typeof optionsRaw === "string"
        ? parseOptions(optionsRaw)
        : [],
    is_required: formData.get("is_required") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("custom_field_definitions").insert({
    workspace_id: workspace.id,
    entity_type: parsed.data.entity_type,
    key: parsed.data.key,
    label: parsed.data.label,
    field_type: parsed.data.field_type,
    options: parsed.data.options,
    is_required: parsed.data.is_required,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "That field key already exists for this entity type"
          : error.message,
    };
  }

  revalidatePath(`/app/${workspaceSlug}/settings/fields`);
  return { error: null };
}

export async function deleteFieldDefinition(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("custom_field_definitions").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/fields`);
}
