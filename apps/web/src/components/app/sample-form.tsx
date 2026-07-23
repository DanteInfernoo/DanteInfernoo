"use client";

import { useActionState } from "react";
import { createSample, type SampleFormState } from "@/app/app/[workspace]/samples/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductRow } from "@/lib/data/products";

const initialState: SampleFormState = { error: null };

export function SampleForm({
  workspaceSlug,
  organizations,
  persons,
  products,
}: {
  workspaceSlug: string;
  organizations: { id: string; name: string }[];
  persons: { id: string; name: string }[];
  products: ProductRow[];
}) {
  const action = createSample.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="organization_id">Account</Label>
          <select
            id="organization_id"
            name="organization_id"
            required
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="person_id">Contact</Label>
          <select
            id="person_id"
            name="person_id"
            defaultValue=""
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- none --</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product_id">Product</Label>
          <select
            id="product_id"
            name="product_id"
            required
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dropped_date">Dropped date</Label>
          <Input
            id="dropped_date"
            name="dropped_date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="follow_up_in_days">Follow up in (days)</Label>
          <Input id="follow_up_in_days" name="follow_up_in_days" type="number" min={1} defaultValue={7} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback">Feedback</Label>
        <textarea
          id="feedback"
          name="feedback"
          rows={2}
          className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
        />
      </div>

      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Logging..." : "Log sample drop"}
      </Button>
    </form>
  );
}
