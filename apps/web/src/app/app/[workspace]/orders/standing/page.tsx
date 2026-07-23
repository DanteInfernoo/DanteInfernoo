import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandingOrderForm } from "@/components/app/standing-order-form";
import {
  StandingOrderToggle,
  DeleteStandingOrderButton,
  GenerateDueOrdersButton,
} from "@/components/app/standing-order-row-actions";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listStandingOrders } from "@/lib/data/standing-orders";
import { listOrganizations } from "@/lib/data/organizations";
import { listProducts } from "@/lib/data/products";

export default async function StandingOrdersPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const [standingOrders, organizations, products] = await Promise.all([
    listStandingOrders(workspace.id),
    listOrganizations(workspace.id),
    listProducts(workspace.id),
  ]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Standing orders</h1>
        <GenerateDueOrdersButton workspaceSlug={slug} />
      </div>

      <StandingOrderForm workspaceSlug={slug} organizations={organizations} products={products} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active schedules</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {standingOrders.map((so) => (
            <div key={so.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm">
              <span className="flex items-center gap-2">
                <StandingOrderToggle id={so.id} workspaceSlug={slug} isActive={so.is_active} />
                {so.name} — {so.organization.name}{" "}
                <span className="text-muted-foreground">
                  ({so.interval}, next {new Date(so.next_generation_date).toLocaleDateString()})
                </span>
              </span>
              <DeleteStandingOrderButton id={so.id} workspaceSlug={slug} />
            </div>
          ))}
          {standingOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No standing orders yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
