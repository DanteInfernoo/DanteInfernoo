import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Workspace: {workspace}</CardTitle>
          <CardDescription>
            Pipelines, contacts, and reporting land here in later phases.
            For now this confirms auth, workspace membership, and RLS are
            wired end to end.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
