"use client";

import { Button } from "@/components/ui/button";
import {
  setDefaultPipeline,
  deletePipeline,
} from "@/app/app/[workspace]/settings/pipelines/actions";

export function SetDefaultButton({
  workspaceSlug,
  pipelineId,
}: {
  workspaceSlug: string;
  pipelineId: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setDefaultPipeline(workspaceSlug, pipelineId)}
    >
      Set default
    </Button>
  );
}

export function DeletePipelineButton({
  workspaceSlug,
  pipelineId,
}: {
  workspaceSlug: string;
  pipelineId: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (confirm("Delete this pipeline and all its deals?")) {
          deletePipeline(workspaceSlug, pipelineId);
        }
      }}
    >
      Delete
    </Button>
  );
}
