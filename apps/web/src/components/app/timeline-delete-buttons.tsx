"use client";

import { X } from "lucide-react";
import { deleteNote, deleteFile } from "@/app/app/[workspace]/timeline-actions";

export function DeleteNoteButton({
  workspaceSlug,
  entityType,
  entityId,
  noteId,
}: {
  workspaceSlug: string;
  entityType: string;
  entityId: string;
  noteId: string;
}) {
  return (
    <button
      type="button"
      aria-label="Delete note"
      className="text-muted-foreground hover:text-destructive"
      onClick={() => deleteNote(workspaceSlug, entityType, entityId, noteId)}
    >
      <X className="size-3.5" />
    </button>
  );
}

export function DeleteFileButton({
  workspaceSlug,
  entityType,
  entityId,
  fileId,
  storagePath,
}: {
  workspaceSlug: string;
  entityType: string;
  entityId: string;
  fileId: string;
  storagePath: string;
}) {
  return (
    <button
      type="button"
      aria-label="Delete file"
      className="text-muted-foreground hover:text-destructive"
      onClick={() =>
        deleteFile(workspaceSlug, entityType, entityId, fileId, storagePath)
      }
    >
      <X className="size-3.5" />
    </button>
  );
}
