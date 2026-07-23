"use server";

import { revalidatePath } from "next/cache";
import { productSchema, priceListSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type ProductFormState = { error: string | null };

export async function createProduct(
  workspaceSlug: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = productSchema.safeParse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    description: formData.get("description") || "",
    uom: formData.get("uom") || "each",
    case_pack: formData.get("case_pack") || undefined,
    case_weight: formData.get("case_weight") || undefined,
    cost: formData.get("cost") || undefined,
    base_price: formData.get("base_price") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    workspace_id: workspace.id,
    sku: parsed.data.sku,
    name: parsed.data.name,
    description: parsed.data.description || null,
    uom: parsed.data.uom,
    case_pack: parsed.data.case_pack ?? null,
    case_weight: parsed.data.case_weight ?? null,
    cost: parsed.data.cost ?? null,
    base_price: parsed.data.base_price,
  });

  if (error) {
    return {
      error: error.code === "23505" ? "That SKU already exists" : error.message,
    };
  }

  revalidatePath(`/app/${workspaceSlug}/settings/products`);
  return { error: null };
}

export async function deleteProduct(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/products`);
}

export async function createPriceList(
  workspaceSlug: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = priceListSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const { error } = await supabase.from("price_lists").insert({
    workspace_id: workspace.id,
    name: parsed.data.name,
  });

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/settings/products`);
  return { error: null };
}

export async function deletePriceList(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("price_lists").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/products`);
}

export async function setPriceListItem(
  workspaceSlug: string,
  priceListId: string,
  formData: FormData,
) {
  const productId = formData.get("product_id") as string;
  const price = Number(formData.get("price"));
  if (!productId || Number.isNaN(price)) return;

  const supabase = await createClient();
  await supabase
    .from("price_list_items")
    .upsert(
      { price_list_id: priceListId, product_id: productId, price },
      { onConflict: "price_list_id,product_id" },
    );

  revalidatePath(`/app/${workspaceSlug}/settings/products`);
}

export async function setAccountPriceOverride(
  workspaceSlug: string,
  organizationId: string,
  formData: FormData,
) {
  const productId = formData.get("product_id") as string;
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  if (!productId) return;

  const supabase = await createClient();
  await supabase
    .from("account_price_overrides")
    .upsert(
      { organization_id: organizationId, product_id: productId, price },
      { onConflict: "organization_id,product_id" },
    );

  revalidatePath(`/app/${workspaceSlug}/organizations/${organizationId}`);
}
