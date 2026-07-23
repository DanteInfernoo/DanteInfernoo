"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGoal } from "@/app/app/[workspace]/settings/goals/actions";

export function DeleteGoalButton({ id, workspaceSlug }: { id: string; workspaceSlug: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => deleteGoal(id, workspaceSlug)}
      aria-label="Delete goal"
    >
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}
