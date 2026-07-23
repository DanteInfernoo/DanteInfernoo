"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteEmailTemplate } from "@/app/app/[workspace]/settings/email-templates/actions";

export function DeleteEmailTemplateButton({
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
      onClick={() => deleteEmailTemplate(id, workspaceSlug)}
      aria-label="Delete template"
    >
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}
