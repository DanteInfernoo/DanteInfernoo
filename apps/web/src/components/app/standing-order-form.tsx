"use client";

import { useActionState } from "react";
import {
  createStandingOrder,
  type StandingOrderFormState,
} from "@/app/app/[workspace]/orders/standing/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductRow } from "@/lib/data/products";

const initialState: StandingOrderFormState = { error: null };

export function StandingOrderForm({
  workspaceSlug,
  organizations,
  products,
}: {
  workspaceSlug: string;
  organizations: { id: string; name: string }[];
  products: ProductRow[];
}) {
  const action = createStandingOrder.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
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
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g. Weekly pita drop" required />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min={1} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="interval">Repeats</Label>
          <select
            id="interval"
            name="interval"
            defaultValue="weekly"
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="next_generation_date">First generation date</Label>
        <Input
          id="next_generation_date"
          name="next_generation_date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>

      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : "Create standing order"}
      </Button>
    </form>
  );
}
