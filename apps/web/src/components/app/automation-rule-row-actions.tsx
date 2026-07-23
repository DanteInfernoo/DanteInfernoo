"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  toggleAutomationRule,
  deleteAutomationRule,
} from "@/app/app/[workspace]/settings/automation/actions";

export function AutomationRuleToggle({
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
      onChange={(e) => toggleAutomationRule(id, workspaceSlug, e.target.checked)}
    />
  );
}

export function DeleteAutomationRuleButton({
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
      onClick={() => deleteAutomationRule(id, workspaceSlug)}
      aria-label="Delete rule"
    >
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}
