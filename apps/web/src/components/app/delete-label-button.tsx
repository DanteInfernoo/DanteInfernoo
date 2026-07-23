"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteLabel } from "@/app/app/[workspace]/settings/labels/actions";

export function DeleteLabelButton({
  id,
  workspaceSlug,
}: {
  id: string;
  workspaceSlug: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => deleteLabel(id, workspaceSlug)}
      aria-label="Delete label"
    >
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}
