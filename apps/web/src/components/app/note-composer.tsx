"use client";

import { useActionState, useRef } from "react";
import { createNote, type NoteFormState } from "@/app/app/[workspace]/timeline-actions";
import { Button } from "@/components/ui/button";

const initialState: NoteFormState = { error: null };

export function NoteComposer({
  workspaceSlug,
  entityType,
  entityId,
  memberNames,
}: {
  workspaceSlug: string;
  entityType: string;
  entityId: string;
  memberNames: string[];
}) {
  const action = createNote.bind(null, workspaceSlug, entityType, entityId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-2"
    >
      <textarea
        name="body"
        rows={3}
        placeholder={`Add a note... mention teammates with @${memberNames[0] ?? "Name"}`}
        className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
      />
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" size="sm" disabled={isPending} className="self-start">
        {isPending ? "Posting..." : "Post note"}
      </Button>
    </form>
  );
}
