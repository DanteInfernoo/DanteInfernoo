"use client";

import { Button } from "@/components/ui/button";
import { reorderFromLast } from "@/app/app/[workspace]/orders/actions";

export function ReorderButton({
  workspaceSlug,
  organizationId,
}: {
  workspaceSlug: string;
  organizationId: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => reorderFromLast(workspaceSlug, organizationId)}
    >
      Reorder last order
    </Button>
  );
}
