"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { organizationSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import {
  parseCustomFieldsFromFormData,
  parseCustomFieldsFromRecord,
} from "@/lib/custom-fields";

export type OrgFormState = { error: string | null };

export async function createOrganization(
  workspaceSlug: string,
  _prevState: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const parsed = organizationSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const fieldDefs = await getFieldDefinitionsForEntity(
    workspace.id,
    "organization",
  );
  const customFields = parseCustomFieldsFromFormData(formData, fieldDefs);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      workspace_id: workspace.id,
      name: parsed.data.name,
      owner_id: user?.id,
      custom_fields: customFields,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/app/${workspaceSlug}/organizations/${data.id}`);
}

export async function updateOrganization(
  workspaceSlug: string,
  organizationId: string,
  _prevState: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const parsed = organizationSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const fieldDefs = await getFieldDefinitionsForEntity(
    workspace.id,
    "organization",
  );
  const customFields = parseCustomFieldsFromFormData(formData, fieldDefs);

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.name, custom_fields: customFields })
    .eq("id", organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/organizations/${organizationId}`);
  return { error: null };
}

export async function deleteOrganization(
  workspaceSlug: string,
  organizationId: string,
) {
  const supabase = await createClient();
  await supabase.from("organizations").delete().eq("id", organizationId);
  redirect(`/app/${workspaceSlug}/organizations`);
}

export async function bulkImportOrganizations(
  workspaceSlug: string,
  rows: Record<string, string>[],
): Promise<{ error?: string; count?: number }> {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const fieldDefs = await getFieldDefinitionsForEntity(
    workspace.id,
    "organization",
  );

  const toInsert = rows
    .filter((row) => row.name?.trim())
    .map((row) => ({
      workspace_id: workspace.id,
      name: row.name.trim(),
      custom_fields: parseCustomFieldsFromRecord(row, fieldDefs),
    }));

  if (toInsert.length === 0) {
    return { error: "No rows had a name column mapped" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("organizations").insert(toInsert);

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/organizations`);
  return { count: toInsert.length };
}

export async function mergeOrganizations(
  workspaceSlug: string,
  primaryId: string,
  duplicateId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("merge_organizations", {
    primary_id: primaryId,
    duplicate_id: duplicateId,
  });

  if (error) throw new Error(error.message);

  redirect(`/app/${workspaceSlug}/organizations/${primaryId}`);
}
