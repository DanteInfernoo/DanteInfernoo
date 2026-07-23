"use client";

import { useActionState, useRef, useState } from "react";
import { renderTemplate, type TemplateContext } from "@crm/shared";
import {
  logEmail,
  type EmailLogFormState,
} from "@/app/app/[workspace]/timeline-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmailTemplateRow } from "@/lib/data/email-templates";

const initialState: EmailLogFormState = { error: null };

export function EmailComposer({
  workspaceSlug,
  entityType,
  entityId,
  templates,
  mergeContext,
}: {
  workspaceSlug: string;
  entityType: "deal" | "person" | "organization";
  entityId: string;
  templates: EmailTemplateRow[];
  mergeContext: TemplateContext;
}) {
  const action = logEmail.bind(null, workspaceSlug, entityType, entityId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(false);

  function applyTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setSubject(renderTemplate(template.subject, mergeContext));
    setBody(renderTemplate(template.body, mergeContext));
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="self-start" onClick={() => setOpen(true)}>
        Log email
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
        setSubject("");
        setBody("");
        setOpen(false);
      }}
      className="flex flex-col gap-2 rounded-lg border p-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <select
          name="direction"
          defaultValue="outbound"
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="outbound">Sent</option>
          <option value="inbound">Received</option>
        </select>
        {templates.length > 0 ? (
          <select
            onChange={(e) => applyTemplate(e.target.value)}
            defaultValue=""
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- use template --</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <Input
        name="to_addresses"
        placeholder="To (comma-separated)"
      />
      <Input
        name="subject"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        name="body"
        rows={4}
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
        required
      />
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Logging..." : "Log email"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
