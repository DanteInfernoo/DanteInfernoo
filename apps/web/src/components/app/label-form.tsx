"use client";

import { useActionState } from "react";
import {
  createLabel,
  type LabelFormState,
} from "@/app/app/[workspace]/settings/labels/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LabelFormState = { error: null };

export function LabelForm({ workspaceSlug }: { workspaceSlug: string }) {
  const action = createLabel.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="entity_type">Entity type</Label>
          <Input
            id="entity_type"
            name="entity_type"
            placeholder="e.g. organization, person"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g. VIP" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="color">Color</Label>
          <input
            id="color"
            name="color"
            type="color"
            defaultValue="#6b7280"
            className="border-input h-9 w-full rounded-md border"
          />
        </div>
      </div>
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Adding..." : "Add label"}
      </Button>
    </form>
  );
}
