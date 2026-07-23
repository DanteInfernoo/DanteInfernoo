import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "@/components/app/order-form";
import { LineItemsEditor } from "@/components/app/line-items-editor";
import { DeleteButton } from "@/components/app/delete-button";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getOrder } from "@/lib/data/orders";
import { listOrganizations } from "@/lib/data/organizations";
import { listLineItems } from "@/lib/data/line-items";
import { listProducts } from "@/lib/data/products";
import { deleteOrder } from "@/app/app/[workspace]/orders/actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; id: string }>;
}) {
  const { workspace: slug, id } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const order = await getOrder(workspace.id, id);
  if (!order) notFound();

  const [organizations, lineItems, products] = await Promise.all([
    listOrganizations(workspace.id),
    listLineItems("order", id),
    listProducts(workspace.id),
  ]);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Order for{" "}
            <Link href={`/app/${slug}/organizations/${order.organization.id}`} className="hover:underline">
              {order.organization.name}
            </Link>
          </h1>
          <p className="text-muted-foreground text-sm">
            ${order.total.toFixed(2)} total
          </p>
        </div>
        <DeleteButton
          action={deleteOrder.bind(null, slug, id)}
          confirmMessage="Delete this order? This cannot be undone."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm workspaceSlug={slug} order={order} organizations={organizations} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsEditor
            workspaceSlug={slug}
            entityType="order"
            entityId={id}
            lineItems={lineItems}
            products={products}
          />
        </CardContent>
      </Card>
    </div>
  );
}
