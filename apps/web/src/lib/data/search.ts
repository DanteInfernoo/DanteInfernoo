import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function searchWorkspace(workspaceId: string, query: string) {
  const supabase = await createClient();
  const like = `%${query}%`;

  const [organizations, persons, deals] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name")
      .eq("workspace_id", workspaceId)
      .ilike("name", like)
      .limit(10),
    supabase
      .from("persons")
      .select("id, name, email")
      .eq("workspace_id", workspaceId)
      .or(`name.ilike.${like},email.ilike.${like}`)
      .limit(10),
    supabase
      .from("deals")
      .select("id, title")
      .eq("workspace_id", workspaceId)
      .ilike("title", like)
      .limit(10),
  ]);

  if (organizations.error) throw new Error(organizations.error.message);
  if (persons.error) throw new Error(persons.error.message);
  if (deals.error) throw new Error(deals.error.message);

  return {
    organizations: organizations.data ?? [],
    persons: persons.data ?? [],
    deals: deals.data ?? [],
  };
}
