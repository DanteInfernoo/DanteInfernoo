import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SampleForm } from "@/components/app/sample-form";
import { DeleteSampleButton } from "@/components/app/delete-sample-button";
import { StatCard } from "@/components/app/stat-card";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listSamples, getSampleConversionRate } from "@/lib/data/samples";
import { listOrganizations } from "@/lib/data/organizations";
import { listPersons } from "@/lib/data/persons";
import { listProducts } from "@/lib/data/products";

export default async function SamplesPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const [samples, conversion, organizations, persons, products] = await Promise.all([
    listSamples(workspace.id),
    getSampleConversionRate(workspace.id),
    listOrganizations(workspace.id),
    listPersons(workspace.id),
    listProducts(workspace.id),
  ]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Samples & Trials</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Samples dropped" value={String(conversion.total)} />
        <StatCard label="Converted" value={String(conversion.converted)} />
        <StatCard label="Conversion rate" value={`${conversion.rate.toFixed(0)}%`} />
      </div>

      <SampleForm
        workspaceSlug={slug}
        organizations={organizations}
        persons={persons.map((p) => ({ id: p.id, name: p.name }))}
        products={products}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sample log</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {samples.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {s.product.name} → {s.organization.name}
                {s.person ? ` (${s.person.name})` : ""}{" "}
                <span className="text-muted-foreground">
                  {new Date(s.dropped_date).toLocaleDateString()}
                  {s.converted_order_id ? " · converted" : ""}
                </span>
              </span>
              <DeleteSampleButton id={s.id} workspaceSlug={slug} />
            </div>
          ))}
          {samples.length === 0 ? (
            <p className="text-muted-foreground py-2 text-sm">No samples logged yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
