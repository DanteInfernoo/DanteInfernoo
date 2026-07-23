"use client";

import { useActionState } from "react";
import {
  createProduct,
  type ProductFormState,
} from "@/app/app/[workspace]/settings/products/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ProductFormState = { error: null };

export function ProductForm({ workspaceSlug }: { workspaceSlug: string }) {
  const action = createProduct.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="uom">Unit of measure</Label>
          <Input id="uom" name="uom" placeholder="case, each, lb" defaultValue="each" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="case_pack">Case pack</Label>
          <Input id="case_pack" name="case_pack" type="number" min={1} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="case_weight">Case weight</Label>
          <Input id="case_weight" name="case_weight" type="number" step="any" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cost">Cost</Label>
          <Input id="cost" name="cost" type="number" step="any" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="base_price">Base price</Label>
          <Input id="base_price" name="base_price" type="number" step="any" required />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" />
      </div>
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Adding..." : "Add product"}
      </Button>
    </form>
  );
}
