"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteActivityType } from "@/app/app/[workspace]/settings/activity-types/actions";

export function DeleteActivityTypeButton({
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
      onClick={() => deleteActivityType(id, workspaceSlug)}
      aria-label="Delete activity type"
    >
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}
