"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteStage,
  moveStage,
} from "@/app/app/[workspace]/settings/pipelines/actions";

export function StageRowActions({
  workspaceSlug,
  pipelineId,
  stageId,
}: {
  workspaceSlug: string;
  pipelineId: string;
  stageId: string;
}) {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => moveStage(workspaceSlug, pipelineId, stageId, "up")}
        aria-label="Move up"
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => moveStage(workspaceSlug, pipelineId, stageId, "down")}
        aria-label="Move down"
      >
        <ArrowDown className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => deleteStage(workspaceSlug, pipelineId, stageId)}
        aria-label="Delete stage"
      >
        <Trash2 className="text-destructive size-4" />
      </Button>
    </div>
  );
}
