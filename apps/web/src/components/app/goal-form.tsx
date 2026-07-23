"use client";

import { useActionState } from "react";
import { createGoal, type GoalFormState } from "@/app/app/[workspace]/settings/goals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: GoalFormState = { error: null };

export function GoalForm({
  workspaceSlug,
  members,
}: {
  workspaceSlug: string;
  members: { id: string; full_name: string | null; email: string }[];
}) {
  const action = createGoal.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const currentPeriod = new Date().toISOString().slice(0, 7);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="metric_type">Metric</Label>
          <select
            id="metric_type"
            name="metric_type"
            defaultValue="revenue"
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="revenue">Revenue</option>
            <option value="deals_won">Deals won</option>
            <option value="activities_completed">Activities completed</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="user_id">For</Label>
          <select
            id="user_id"
            name="user_id"
            defaultValue=""
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">Whole workspace</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name ?? m.email}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="period">Month</Label>
          <Input id="period" name="period" type="month" defaultValue={currentPeriod} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="target_value">Target</Label>
          <Input id="target_value" name="target_value" type="number" min={1} required />
        </div>
      </div>
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : "Add goal"}
      </Button>
    </form>
  );
}
