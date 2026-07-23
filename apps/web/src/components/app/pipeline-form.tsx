"use client";

import { useActionState } from "react";
import {
  createPipeline,
  type SettingsFormState,
} from "@/app/app/[workspace]/settings/pipelines/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SettingsFormState = { error: null };

export function PipelineForm({ workspaceSlug }: { workspaceSlug: string }) {
  const action = createPipeline.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex gap-2">
      <div className="flex-1">
        <Label htmlFor="name" className="sr-only">
          Pipeline name
        </Label>
        <Input id="name" name="name" placeholder="e.g. Sales Pipeline" required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "New pipeline"}
      </Button>
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
    </form>
  );
}
