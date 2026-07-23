import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "@/components/app/order-form";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listOrganizations } from "@/lib/data/organizations";

export default async function NewOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ organization_id?: string }>;
}) {
  const { workspace: slug } = await params;
  const { organization_id } = await searchParams;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const organizations = await listOrganizations(workspace.id);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>New order</CardTitle>
      </CardHeader>
      <CardContent>
        <OrderForm
          workspaceSlug={slug}
          organizations={organizations}
          defaultOrganizationId={organization_id}
        />
      </CardContent>
    </Card>
  );
}
