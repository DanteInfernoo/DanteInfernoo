import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type SampleRow = Database["public"]["Tables"]["samples"]["Row"];
export type SampleWithRelations = SampleRow & {
  organization: { id: string; name: string };
  person: { id: string; name: string } | null;
  product: { id: string; name: string };
};

export async function listSamples(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("samples")
    .select(
      "*, organization:organizations(id, name), person:persons(id, name), product:products(id, name)",
    )
    .eq("workspace_id", workspaceId)
    .order("dropped_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SampleWithRelations[];
}

export async function getSampleConversionRate(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("samples")
    .select("converted_order_id")
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);
  const samples = data ?? [];
  const converted = samples.filter((s) => s.converted_order_id !== null).length;
  return {
    total: samples.length,
    converted,
    rate: samples.length > 0 ? (converted / samples.length) * 100 : 0,
  };
}
