import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listOrders } from "@/lib/data/orders";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const orders = await listOrders(workspace.id);

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/app/${slug}/orders/standing`}>Standing orders</Link>
          </Button>
          <Button asChild>
            <Link href={`/app/${slug}/orders/new`}>New order</Link>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Account</th>
              <th className="px-3 py-2 font-medium">PO</th>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-accent">
                <td className="px-3 py-2">
                  <Link href={`/app/${slug}/orders/${o.id}`} className="hover:underline">
                    {o.organization.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{o.po_number ?? ""}</td>
                <td className="px-3 py-2">{new Date(o.order_date).toLocaleDateString()}</td>
                <td className="px-3 py-2 capitalize">{o.status.replace("_", " ")}</td>
                <td className="px-3 py-2">${o.total.toFixed(2)}</td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted-foreground px-3 py-6 text-center">
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
