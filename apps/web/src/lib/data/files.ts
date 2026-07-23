import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type FileRow = Database["public"]["Tables"]["files"]["Row"];
export type FileWithUploader = FileRow & {
  uploader: { id: string; full_name: string | null; email: string } | null;
};

export async function listFilesForEntity(entityType: string, entityId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("files")
    .select("*, uploader:profiles(id, full_name, email)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as FileWithUploader[];
}

export async function getFileDownloadUrl(storagePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("attachments")
    .createSignedUrl(storagePath, 60 * 5);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}
