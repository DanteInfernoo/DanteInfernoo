"use client";

import { useActionState, useState } from "react";
import { createFieldDefinition, type FieldFormState } from "@/app/app/[workspace]/settings/fields/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: FieldFormState = { error: null };

const FIELD_TYPES = [
  "text",
  "number",
  "date",
  "dropdown",
  "multiselect",
  "currency",
  "checkbox",
] as const;

export function FieldDefinitionForm({ workspaceSlug }: { workspaceSlug: string }) {
  const createFieldDefinitionForWorkspace = createFieldDefinition.bind(
    null,
    workspaceSlug,
  );
  const [state, formAction, isPending] = useActionState(
    createFieldDefinitionForWorkspace,
    initialState,
  );
  const [fieldType, setFieldType] = useState<string>("text");

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="entity_type">Entity type</Label>
          <Input
            id="entity_type"
            name="entity_type"
            placeholder="e.g. organization, person, deal"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="field_type">Field type</Label>
          <select
            id="field_type"
            name="field_type"
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" placeholder="e.g. Account Type" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="key">Key</Label>
          <Input id="key" name="key" placeholder="e.g. account_type" required />
        </div>
      </div>

      {fieldType === "dropdown" || fieldType === "multiselect" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="options_raw">Options (comma-separated)</Label>
          <Input
            id="options_raw"
            name="options_raw"
            placeholder="e.g. Direct, Distributor, Location"
          />
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_required" className="size-4" />
        Required
      </label>

      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Adding..." : "Add field"}
      </Button>
    </form>
  );
}
