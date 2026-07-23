"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { personSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import {
  parseCustomFieldsFromFormData,
  parseCustomFieldsFromRecord,
} from "@/lib/custom-fields";

export type PersonFormState = { error: string | null };

function readPersonFields(formData: FormData) {
  return personSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    organization_id: formData.get("organization_id") || "",
  });
}

export async function createPerson(
  workspaceSlug: string,
  _prevState: PersonFormState,
  formData: FormData,
): Promise<PersonFormState> {
  const parsed = readPersonFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const fieldDefs = await getFieldDefinitionsForEntity(workspace.id, "person");
  const customFields = parseCustomFieldsFromFormData(formData, fieldDefs);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("persons")
    .insert({
      workspace_id: workspace.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      organization_id: parsed.data.organization_id || null,
      owner_id: user?.id,
      custom_fields: customFields,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/app/${workspaceSlug}/persons/${data.id}`);
}

export async function updatePerson(
  workspaceSlug: string,
  personId: string,
  _prevState: PersonFormState,
  formData: FormData,
): Promise<PersonFormState> {
  const parsed = readPersonFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const fieldDefs = await getFieldDefinitionsForEntity(workspace.id, "person");
  const customFields = parseCustomFieldsFromFormData(formData, fieldDefs);

  const supabase = await createClient();
  const { error } = await supabase
    .from("persons")
    .update({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      organization_id: parsed.data.organization_id || null,
      custom_fields: customFields,
    })
    .eq("id", personId);

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/persons/${personId}`);
  return { error: null };
}

export async function deletePerson(workspaceSlug: string, personId: string) {
  const supabase = await createClient();
  await supabase.from("persons").delete().eq("id", personId);
  redirect(`/app/${workspaceSlug}/persons`);
}

export async function mergePersons(
  workspaceSlug: string,
  primaryId: string,
  duplicateId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("merge_persons", {
    primary_id: primaryId,
    duplicate_id: duplicateId,
  });

  if (error) throw new Error(error.message);

  redirect(`/app/${workspaceSlug}/persons/${primaryId}`);
}

export async function bulkImportPersons(
  workspaceSlug: string,
  rows: Record<string, string>[],
): Promise<{ error?: string; count?: number }> {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const fieldDefs = await getFieldDefinitionsForEntity(workspace.id, "person");

  const supabase = await createClient();

  const orgNames = [
    ...new Set(
      rows.map((r) => r.organization_name?.trim()).filter(Boolean),
    ),
  ] as string[];

  const orgIdByName = new Map<string, string>();
  if (orgNames.length > 0) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("workspace_id", workspace.id)
      .in("name", orgNames);
    for (const org of orgs ?? []) orgIdByName.set(org.name, org.id);
  }

  const toInsert = rows
    .filter((row) => row.name?.trim())
    .map((row) => ({
      workspace_id: workspace.id,
      name: row.name.trim(),
      email: row.email?.trim() || null,
      phone: row.phone?.trim() || null,
      organization_id: row.organization_name
        ? (orgIdByName.get(row.organization_name.trim()) ?? null)
        : null,
      custom_fields: parseCustomFieldsFromRecord(row, fieldDefs),
    }));

  if (toInsert.length === 0) {
    return { error: "No rows had a name column mapped" };
  }

  const { error } = await supabase.from("persons").insert(toInsert);
  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/persons`);
  return { count: toInsert.length };
}
