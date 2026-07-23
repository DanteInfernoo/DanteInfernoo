"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSample } from "@/app/app/[workspace]/samples/actions";

export function DeleteSampleButton({ id, workspaceSlug }: { id: string; workspaceSlug: string }) {
  return (
    <Button variant="ghost" size="icon" onClick={() => deleteSample(id, workspaceSlug)} aria-label="Delete sample">
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}
