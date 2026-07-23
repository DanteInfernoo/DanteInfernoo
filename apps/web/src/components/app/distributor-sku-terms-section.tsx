"use client";

import { setDistributorSkuTerm } from "@/app/app/[workspace]/organizations/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DistributorSkuTermRow } from "@/lib/data/distributor-terms";
import type { ProductRow } from "@/lib/data/products";

export function DistributorSkuTermsSection({
  workspaceSlug,
  organizationId,
  terms,
  products,
}: {
  workspaceSlug: string;
  organizationId: string;
  terms: (DistributorSkuTermRow & { product: { id: string; name: string; sku: string } })[];
  products: ProductRow[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col divide-y rounded-md border">
        {terms.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
            <span>{t.product.name} ({t.product.sku})</span>
            <span className="flex items-center gap-3">
              <span>{t.margin_pct ?? "—"}% margin</span>
              <span className="capitalize">{t.listing_status}</span>
            </span>
          </div>
        ))}
        {terms.length === 0 ? (
          <p className="text-muted-foreground px-3 py-2 text-sm">No SKU terms yet.</p>
        ) : null}
      </div>

      <form
        action={(formData) => setDistributorSkuTerm(workspaceSlug, organizationId, formData)}
        className="flex items-center gap-2"
      >
        <select
          name="product_id"
          required
          className="border-input h-8 rounded-md border bg-transparent px-2 text-sm shadow-xs"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Input name="margin_pct" type="number" step="any" placeholder="Margin %" className="h-8 w-24" />
        <select
          name="listing_status"
          defaultValue="listed"
          className="border-input h-8 rounded-md border bg-transparent px-2 text-sm shadow-xs"
        >
          <option value="listed">Listed</option>
          <option value="pending">Pending</option>
          <option value="delisted">Delisted</option>
        </select>
        <Button type="submit" size="sm" variant="outline">
          Save
        </Button>
      </form>
    </div>
  );
}
