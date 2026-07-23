"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { organizationSchema, commercialTermsSchema } from "@crm/shared";
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

export type CommercialTermsFormState = { error: string | null };

export async function updateCommercialTerms(
  workspaceSlug: string,
  organizationId: string,
  _prevState: CommercialTermsFormState,
  formData: FormData,
): Promise<CommercialTermsFormState> {
  const parsed = commercialTermsSchema.safeParse({
    account_type: formData.get("account_type") || "",
    parent_organization_id: formData.get("parent_organization_id") || "",
    territory_id: formData.get("territory_id") || "",
    delivery_day: formData.get("delivery_day") || undefined,
    payment_terms: formData.get("payment_terms") || "",
    credit_limit: formData.get("credit_limit") || undefined,
    outstanding_balance: formData.get("outstanding_balance") || 0,
    is_tax_exempt: formData.get("is_tax_exempt") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      account_type: parsed.data.account_type || null,
      parent_organization_id: parsed.data.parent_organization_id || null,
      territory_id: parsed.data.territory_id || null,
      delivery_day: parsed.data.delivery_day ?? null,
      payment_terms: parsed.data.payment_terms || null,
      credit_limit: parsed.data.credit_limit ?? null,
      outstanding_balance: parsed.data.outstanding_balance,
      is_tax_exempt: parsed.data.is_tax_exempt,
    })
    .eq("id", organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/organizations/${organizationId}`);
  return { error: null };
}

export async function setDistributorSkuTerm(
  workspaceSlug: string,
  organizationId: string,
  formData: FormData,
) {
  const productId = formData.get("product_id") as string;
  const marginPct = formData.get("margin_pct") ? Number(formData.get("margin_pct")) : null;
  const listingStatus = (formData.get("listing_status") as string) || "pending";
  if (!productId) return;

  const supabase = await createClient();
  await supabase.from("distributor_sku_terms").upsert(
    {
      organization_id: organizationId,
      product_id: productId,
      margin_pct: marginPct,
      listing_status: listingStatus,
    },
    { onConflict: "organization_id,product_id" },
  );

  revalidatePath(`/app/${workspaceSlug}/organizations/${organizationId}`);
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
