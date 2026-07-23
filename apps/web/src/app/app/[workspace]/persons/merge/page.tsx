import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listPersons } from "@/lib/data/persons";
import { mergePersons } from "@/app/app/[workspace]/persons/actions";

export default async function MergePersonsPage({
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

  const persons = await listPersons(workspace.id);

  async function merge(formData: FormData) {
    "use server";
    const primaryId = formData.get("primary_id") as string;
    const duplicateId = formData.get("duplicate_id") as string;
    if (primaryId === duplicateId) return;
    await mergePersons(slug, primaryId, duplicateId);
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Merge people</CardTitle>
        <CardDescription>
          The record you keep wins on conflicting fields; the other is
          deleted and its labels are reassigned to the one you keep.
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
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.email ? `(${p.email})` : ""}
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
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.email ? `(${p.email})` : ""}
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
