import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type EmailRow = Database["public"]["Tables"]["emails"]["Row"];
export type EmailWithLogger = EmailRow & {
  logger: { id: string; full_name: string | null; email: string } | null;
};

export async function listEmailsForEntity(
  entity: "deal" | "person" | "organization",
  entityId: string,
) {
  const supabase = await createClient();
  const column = `${entity}_id`;
  const { data, error } = await supabase
    .from("emails")
    .select("*, logger:profiles(id, full_name, email)")
    .eq(column, entityId)
    .order("sent_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as EmailWithLogger[];
}
