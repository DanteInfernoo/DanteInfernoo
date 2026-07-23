import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrganizationForm } from "@/components/app/organization-form";
import { DeleteButton } from "@/components/app/delete-button";
import { LabelAttacher } from "@/components/app/label-attacher";
import { EntityTimeline } from "@/components/app/entity-timeline";
import { CommercialTermsForm } from "@/components/app/commercial-terms-form";
import { AccountHealthCard } from "@/components/app/account-health-card";
import { ReorderButton } from "@/components/app/reorder-button";
import { DistributorSkuTermsSection } from "@/components/app/distributor-sku-terms-section";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import {
  getOrganization,
  listPersonsForOrganization,
  listChildOrganizations,
  listOrganizations,
} from "@/lib/data/organizations";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { listEntityLabels, listLabels } from "@/lib/data/labels";
import { listTerritories } from "@/lib/data/territories";
import { listOrdersForOrganization } from "@/lib/data/orders";
import { listProducts } from "@/lib/data/products";
import { listDistributorSkuTerms, getDistributorRollupRevenue } from "@/lib/data/distributor-terms";
import { deleteOrganization } from "@/app/app/[workspace]/organizations/actions";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; id: string }>;
}) {
  const { workspace: slug, id } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const organization = await getOrganization(workspace.id, id);
  if (!organization) notFound();

  const [fieldDefs, persons, attachedLabels, availableLabels] =
    await Promise.all([
      getFieldDefinitionsForEntity(workspace.id, "organization"),
      listPersonsForOrganization(workspace.id, id),
      listEntityLabels("organization", id),
      listLabels(workspace.id, "organization"),
    ]);

  const enabledModules = new Set((workspace.enabled_modules as string[] | null) ?? []);
  const ordersEnabled = enabledModules.has("orders");
  const territoriesEnabled = enabledModules.has("territories");
  const productsEnabled = enabledModules.has("products");
  const showCommercialTerms = ordersEnabled || territoriesEnabled;

  const [territories, orders, childOrganizations, allOrganizations, products, distributorTerms, rollupRevenue] =
    await Promise.all([
      territoriesEnabled ? listTerritories(workspace.id) : Promise.resolve([]),
      ordersEnabled ? listOrdersForOrganization(id) : Promise.resolve([]),
      territoriesEnabled ? listChildOrganizations(id) : Promise.resolve([]),
      territoriesEnabled ? listOrganizations(workspace.id) : Promise.resolve([]),
      productsEnabled ? listProducts(workspace.id) : Promise.resolve([]),
      territoriesEnabled && organization.account_type === "distributor"
        ? listDistributorSkuTerms(id)
        : Promise.resolve([]),
      territoriesEnabled && organization.account_type === "distributor"
        ? getDistributorRollupRevenue(id)
        : Promise.resolve(0),
    ]);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{organization.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/app/${slug}/organizations/merge?a=${id}`}>Merge</Link>
          </Button>
          <DeleteButton
            action={deleteOrganization.bind(null, slug, id)}
            confirmMessage="Delete this organization? This cannot be undone."
          />
        </div>
      </div>

      <LabelAttacher
        workspaceSlug={slug}
        entityType="organization"
        entityId={id}
        attached={attachedLabels}
        available={availableLabels}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationForm
            workspaceSlug={slug}
            organization={organization}
            fieldDefs={fieldDefs}
          />
        </CardContent>
      </Card>

      {showCommercialTerms ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commercial terms</CardTitle>
          </CardHeader>
          <CardContent>
            <CommercialTermsForm
              workspaceSlug={slug}
              organization={organization}
              territories={territories}
              potentialParents={allOrganizations.filter((o) => o.id !== id)}
              showDistributorFields={territoriesEnabled}
            />
          </CardContent>
        </Card>
      ) : null}

      {territoriesEnabled && organization.account_type === "distributor" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distributor SKU terms</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributorSkuTermsSection
              workspaceSlug={slug}
              organizationId={id}
              terms={distributorTerms}
              products={products}
            />
          </CardContent>
        </Card>
      ) : null}

      {territoriesEnabled && organization.account_type === "distributor" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Locations under this account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm">
              Rollup revenue: <span className="font-medium">${rollupRevenue.toFixed(2)}</span>
            </p>
            <div className="flex flex-col divide-y rounded-md border">
              {childOrganizations.map((c) => (
                <Link
                  key={c.id}
                  href={`/app/${slug}/organizations/${c.id}`}
                  className="hover:bg-accent px-3 py-2 text-sm"
                >
                  {c.name}
                </Link>
              ))}
              {childOrganizations.length === 0 ? (
                <p className="text-muted-foreground px-3 py-2 text-sm">No linked locations yet.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {ordersEnabled ? (
        <AccountHealthCard orders={orders} />
      ) : null}

      {ordersEnabled ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Orders</CardTitle>
            {orders.length > 0 ? (
              <ReorderButton workspaceSlug={slug} organizationId={id} />
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/app/${slug}/orders/${o.id}`}
                className="hover:bg-accent flex items-center justify-between px-2 py-2 text-sm"
              >
                <span>{new Date(o.order_date).toLocaleDateString()}</span>
                <span className="capitalize">{o.status}</span>
                <span>${Number(o.total).toFixed(2)}</span>
              </Link>
            ))}
            {orders.length === 0 ? (
              <p className="text-muted-foreground px-2 py-2 text-sm">No orders yet.</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">People at this organization</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {persons.map((p) => (
            <Link
              key={p.id}
              href={`/app/${slug}/persons/${p.id}`}
              className="hover:bg-accent rounded-md px-2 py-1.5 text-sm"
            >
              {p.name} {p.email ? `· ${p.email}` : ""}
            </Link>
          ))}
          {persons.length === 0 ? (
            <p className="text-muted-foreground text-sm">No contacts yet.</p>
          ) : null}
        </CardContent>
      </Card>

      <EntityTimeline
        workspaceSlug={slug}
        workspaceId={workspace.id}
        entityType="organization"
        entityId={id}
        mergeContext={{ organization: { name: organization.name } }}
      />
    </div>
  );
}
