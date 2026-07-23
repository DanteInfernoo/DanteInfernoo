"use client";

import { X } from "lucide-react";
import { deleteEmail } from "@/app/app/[workspace]/timeline-actions";

export function DeleteEmailButton({
  workspaceSlug,
  entityType,
  entityId,
  emailId,
}: {
  workspaceSlug: string;
  entityType: string;
  entityId: string;
  emailId: string;
}) {
  return (
    <button
      type="button"
      aria-label="Delete email"
      className="text-muted-foreground hover:text-destructive"
      onClick={() => deleteEmail(workspaceSlug, entityType, entityId, emailId)}
    >
      <X className="size-3.5" />
    </button>
  );
}
