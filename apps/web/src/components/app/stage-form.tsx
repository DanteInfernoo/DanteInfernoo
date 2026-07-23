"use client";

import { useActionState } from "react";
import {
  createStage,
  type SettingsFormState,
} from "@/app/app/[workspace]/settings/pipelines/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SettingsFormState = { error: null };

export function StageForm({
  workspaceSlug,
  pipelineId,
}: {
  workspaceSlug: string;
  pipelineId: string;
}) {
  const action = createStage.bind(null, workspaceSlug, pipelineId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Stage name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="probability">Win probability %</Label>
          <Input
            id="probability"
            name="probability"
            type="number"
            min={0}
            max={100}
            defaultValue={50}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rotten_days">Rot after (days)</Label>
          <Input
            id="rotten_days"
            name="rotten_days"
            type="number"
            min={1}
            placeholder="optional"
          />
        </div>
      </div>
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Adding..." : "Add stage"}
      </Button>
    </form>
  );
}
