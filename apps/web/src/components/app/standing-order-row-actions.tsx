"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  toggleStandingOrder,
  deleteStandingOrder,
  generateDueOrdersNow,
} from "@/app/app/[workspace]/orders/standing/actions";

export function StandingOrderToggle({
  id,
  workspaceSlug,
  isActive,
}: {
  id: string;
  workspaceSlug: string;
  isActive: boolean;
}) {
  return (
    <input
      type="checkbox"
      defaultChecked={isActive}
      className="size-4"
      onChange={(e) => toggleStandingOrder(id, workspaceSlug, e.target.checked)}
    />
  );
}

export function DeleteStandingOrderButton({
  id,
  workspaceSlug,
}: {
  id: string;
  workspaceSlug: string;
}) {
  return (
    <Button variant="ghost" size="icon" onClick={() => deleteStandingOrder(id, workspaceSlug)} aria-label="Delete">
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}

export function GenerateDueOrdersButton({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const count = await generateDueOrdersNow(workspaceSlug);
        alert(`Generated ${count} order(s).`);
      }}
    >
      Generate due orders now
    </Button>
  );
}
