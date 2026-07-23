"use client";

import { toggleModule } from "@/app/app/[workspace]/settings/modules/actions";

export function ModuleToggle({
  workspaceSlug,
  moduleKey,
  label,
  description,
  enabled,
}: {
  workspaceSlug: string;
  moduleKey: string;
  label: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-md border p-3">
      <input
        type="checkbox"
        defaultChecked={enabled}
        className="mt-1 size-4"
        onChange={(e) => toggleModule(workspaceSlug, moduleKey, e.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="text-muted-foreground block text-xs">{description}</span>
      </span>
    </label>
  );
}
