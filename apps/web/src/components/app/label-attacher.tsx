"use client";

import { X } from "lucide-react";
import {
  attachLabel,
  detachLabel,
} from "@/app/app/[workspace]/settings/labels/actions";

interface LabelOption {
  id: string;
  name: string;
  color: string;
}

export function LabelAttacher({
  workspaceSlug,
  entityType,
  entityId,
  attached,
  available,
}: {
  workspaceSlug: string;
  entityType: string;
  entityId: string;
  attached: { label_id: string; label: LabelOption }[];
  available: LabelOption[];
}) {
  const attachedIds = new Set(attached.map((a) => a.label_id));
  const options = available.filter((l) => !attachedIds.has(l.id));
  const attachAction = attachLabel.bind(
    null,
    workspaceSlug,
    entityType,
    entityId,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {attached.map((a) => (
        <span
          key={a.label_id}
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-white"
          style={{ backgroundColor: a.label.color }}
        >
          {a.label.name}
          <button
            type="button"
            aria-label={`Remove ${a.label.name}`}
            onClick={() =>
              detachLabel(workspaceSlug, entityType, entityId, a.label_id)
            }
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      {options.length > 0 ? (
        <form action={attachAction}>
          <select
            name="label_id"
            defaultValue=""
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="border-input h-7 rounded-md border bg-transparent px-2 text-xs shadow-xs"
          >
            <option value="" disabled>
              + Add label
            </option>
            {options.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </form>
      ) : null}
    </div>
  );
}
