import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listOrganizations } from "@/lib/data/organizations";
import { mergeOrganizations } from "@/app/app/[workspace]/organizations/actions";

export default async function MergeOrganizationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ a?: string }>;
}) {
  const { workspace: slug } = await params;
  const { a } = await searchParams;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const organizations = await listOrganizations(workspace.id);

  async function merge(formData: FormData) {
    "use server";
    const primaryId = formData.get("primary_id") as string;
    const duplicateId = formData.get("duplicate_id") as string;
    if (primaryId === duplicateId) return;
    await mergeOrganizations(slug, primaryId, duplicateId);
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Merge organizations</CardTitle>
        <CardDescription>
          The record you keep wins on conflicting fields; the other is deleted
          and its contacts and labels are reassigned to the one you keep.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={merge} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="primary_id">Keep</Label>
            <select
              id="primary_id"
              name="primary_id"
              defaultValue={a}
              required
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
            >
              <option value="" />
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="duplicate_id">Merge in (deleted after merge)</Label>
            <select
              id="duplicate_id"
              name="duplicate_id"
              required
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
            >
              <option value="" />
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="self-start">
            Merge
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
