import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/app/product-form";
import { DeleteProductButton, DeletePriceListButton } from "@/components/app/product-row-actions";
import { PriceListItemForm } from "@/components/app/price-list-item-form";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listProducts, listPriceLists, listPriceListItems } from "@/lib/data/products";
import { createPriceList } from "@/app/app/[workspace]/settings/products/actions";

export default async function ProductsSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const [products, priceLists] = await Promise.all([
    listProducts(workspace.id),
    listPriceLists(workspace.id),
  ]);

  const priceListItemsByList = await Promise.all(
    priceLists.map((pl) => listPriceListItems(pl.id)),
  );

  async function handleCreatePriceList(formData: FormData) {
    "use server";
    await createPriceList(slug, { error: null }, formData);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-muted-foreground text-sm">
          Catalog, unit of measure, cost, and base price.
        </p>
      </div>

      <ProductForm workspaceSlug={slug} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catalog</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm">
              <span>
                {p.name} <span className="text-muted-foreground">({p.sku}, {p.uom})</span>
              </span>
              <span className="flex items-center gap-3">
                <span>${p.base_price.toFixed(2)}</span>
                <DeleteProductButton id={p.id} workspaceSlug={slug} />
              </span>
            </div>
          ))}
          {products.length === 0 ? (
            <p className="text-muted-foreground text-sm">No products yet.</p>
          ) : null}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold">Price lists</h2>
        <p className="text-muted-foreground text-sm">
          Distributor, direct retail, food service, promotional — as many as you need.
        </p>
      </div>

      <form action={handleCreatePriceList} className="flex gap-2">
        <Input name="name" placeholder="e.g. Food Service" required />
        <Button type="submit">New price list</Button>
      </form>

      {priceLists.map((pl, i) => (
        <Card key={pl.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{pl.name}</CardTitle>
            <DeletePriceListButton id={pl.id} workspaceSlug={slug} />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {priceListItemsByList[i].map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.product.name} ({item.product.sku})</span>
                <span className="font-medium">${item.price.toFixed(2)}</span>
              </div>
            ))}
            {products.length > 0 ? (
              <PriceListItemForm workspaceSlug={slug} priceListId={pl.id} products={products} />
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
