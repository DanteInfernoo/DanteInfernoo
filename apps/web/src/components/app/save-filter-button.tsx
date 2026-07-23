"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createSavedFilter,
  type SavedFilterFormState,
} from "@/app/app/[workspace]/saved-filters-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: SavedFilterFormState = { error: null };

export function SaveFilterButton({
  workspaceSlug,
  entityType,
  listPath,
}: {
  workspaceSlug: string;
  entityType: string;
  listPath: string;
}) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const filterParams = Object.fromEntries(searchParams.entries());

  const action = createSavedFilter.bind(
    null,
    workspaceSlug,
    entityType,
    listPath,
    filterParams,
  );
  const [state, formAction, isPending] = useActionState(action, initialState);

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Save this view
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await formAction(formData);
        setOpen(false);
      }}
      className="flex items-center gap-2"
    >
      <Input name="name" placeholder="View name" className="h-8 w-40" required />
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" name="is_shared" className="size-3.5" />
        Share with team
      </label>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {state.error ? <span className="text-destructive text-xs">{state.error}</span> : null}
    </form>
  );
}
