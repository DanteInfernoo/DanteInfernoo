"use client";

import { useActionState } from "react";
import {
  createActivityType,
  type ActivityTypeFormState,
} from "@/app/app/[workspace]/settings/activity-types/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActivityTypeFormState = { error: null };

export function ActivityTypeForm({ workspaceSlug }: { workspaceSlug: string }) {
  const action = createActivityType.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g. Call" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="icon">Icon (lucide name)</Label>
          <Input id="icon" name="icon" placeholder="phone" defaultValue="circle" />
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
        {isPending ? "Adding..." : "Add activity type"}
      </Button>
    </form>
  );
}
