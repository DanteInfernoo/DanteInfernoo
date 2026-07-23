import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealForm } from "@/components/app/deal-form";
import { DealStatusActions } from "@/components/app/deal-status-actions";
import { DeleteButton } from "@/components/app/delete-button";
import { EntityTimeline } from "@/components/app/entity-timeline";
import { LineItemsEditor } from "@/components/app/line-items-editor";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getDeal } from "@/lib/data/deals";
import { getPipelineWithStages } from "@/lib/data/pipelines";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { listOrganizations } from "@/lib/data/organizations";
import { listPersons } from "@/lib/data/persons";
import { listLineItems } from "@/lib/data/line-items";
import { listProducts } from "@/lib/data/products";
import { deleteDeal } from "@/app/app/[workspace]/deals/actions";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; id: string }>;
}) {
  const { workspace: slug, id } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const deal = await getDeal(workspace.id, id);
  if (!deal) notFound();

  const [pipeline, fieldDefs, organizations, persons] = await Promise.all([
    getPipelineWithStages(workspace.id, deal.pipeline_id),
    getFieldDefinitionsForEntity(workspace.id, "deal"),
    listOrganizations(workspace.id),
    listPersons(workspace.id),
  ]);

  const stage = pipeline?.stages.find((s) => s.id === deal.stage_id);
  const productsEnabled = ((workspace.enabled_modules as string[] | null) ?? []).includes(
    "products",
  );
  const [lineItems, products] = productsEnabled
    ? await Promise.all([listLineItems("deal", id), listProducts(workspace.id)])
    : [[], []];

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{deal.title}</h1>
          <p className="text-muted-foreground text-sm">
            {pipeline?.name} · {stage?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DealStatusActions
            workspaceSlug={slug}
            dealId={deal.id}
            status={deal.status}
          />
          <DeleteButton
            action={deleteDeal.bind(null, slug, deal.id)}
            confirmMessage="Delete this deal? This cannot be undone."
          />
        </div>
      </div>

      {deal.status === "lost" && deal.lost_reason ? (
        <p className="text-muted-foreground text-sm">
          Lost reason: {deal.lost_reason}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DealForm
            workspaceSlug={slug}
            deal={deal}
            fieldDefs={fieldDefs}
            organizations={organizations}
            persons={persons.map((p) => ({ id: p.id, name: p.name }))}
          />
        </CardContent>
      </Card>

      {productsEnabled ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Line items</CardTitle>
          </CardHeader>
          <CardContent>
            <LineItemsEditor
              workspaceSlug={slug}
              entityType="deal"
              entityId={id}
              lineItems={lineItems}
              products={products}
            />
          </CardContent>
        </Card>
      ) : null}

      <EntityTimeline
        workspaceSlug={slug}
        workspaceId={workspace.id}
        entityType="deal"
        entityId={id}
        mergeContext={{
          deal: { title: deal.title, value: deal.value },
          organization: deal.organization ? { name: deal.organization.name } : undefined,
          person: deal.person ? { name: deal.person.name } : undefined,
        }}
      />
    </div>
  );
}
