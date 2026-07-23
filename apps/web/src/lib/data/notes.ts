import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
export type NoteWithAuthor = NoteRow & {
  author: { id: string; full_name: string | null; email: string } | null;
};

export async function listNotesForEntity(entityType: string, entityId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*, author:profiles(id, full_name, email)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as NoteWithAuthor[];
}
