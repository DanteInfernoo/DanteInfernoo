"use client";

import { useActionState } from "react";
import {
  createTerritory,
  type TerritoryFormState,
} from "@/app/app/[workspace]/settings/territories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: TerritoryFormState = { error: null };

export function TerritoryForm({ workspaceSlug }: { workspaceSlug: string }) {
  const action = createTerritory.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex gap-2">
      <Input name="name" placeholder="e.g. North Route" required />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add territory"}
      </Button>
      {state.error ? <span className="text-destructive self-center text-sm">{state.error}</span> : null}
    </form>
  );
}
