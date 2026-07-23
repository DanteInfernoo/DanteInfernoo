"use client";

import { useActionState } from "react";
import {
  createEmailTemplate,
  type EmailTemplateFormState,
} from "@/app/app/[workspace]/settings/email-templates/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: EmailTemplateFormState = { error: null };

export function EmailTemplateForm({ workspaceSlug }: { workspaceSlug: string }) {
  const action = createEmailTemplate.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Template name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            placeholder="e.g. Following up, {{person.name}}"
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">Body</Label>
        <textarea
          id="body"
          name="body"
          rows={5}
          placeholder="Use {{person.name}}, {{organization.name}}, {{deal.title}} as merge fields"
          className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
          required
        />
      </div>
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : "Save template"}
      </Button>
    </form>
  );
}
