"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteFieldDefinition } from "@/app/app/[workspace]/settings/fields/actions";

export function DeleteFieldButton({
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
      onClick={() => deleteFieldDefinition(id, workspaceSlug)}
      aria-label="Delete field"
    >
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}
