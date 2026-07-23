import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MembershipSummary {
  role: string;
  workspace: { id: string; name: string; slug: string };
}

export async function getUserMemberships(): Promise<MembershipSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspace:workspaces(id, name, slug)")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as MembershipSummary[];
}

export async function getWorkspaceBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, slug, enabled_modules, settings")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
