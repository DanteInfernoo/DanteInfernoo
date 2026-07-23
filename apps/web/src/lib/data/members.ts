import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listWorkspaceMembers(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, profile:profiles(id, full_name, email)")
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as {
    role: string;
    profile: { id: string; full_name: string | null; email: string };
  }[];
}
