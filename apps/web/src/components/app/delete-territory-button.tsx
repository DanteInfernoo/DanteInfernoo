"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTerritory } from "@/app/app/[workspace]/settings/territories/actions";

export function DeleteTerritoryButton({ id, workspaceSlug }: { id: string; workspaceSlug: string }) {
  return (
    <Button variant="ghost" size="icon" onClick={() => deleteTerritory(id, workspaceSlug)} aria-label="Delete territory">
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}
