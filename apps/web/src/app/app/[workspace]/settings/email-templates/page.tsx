import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailTemplateForm } from "@/components/app/email-template-form";
import { DeleteEmailTemplateButton } from "@/components/app/delete-email-template-button";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listEmailTemplates } from "@/lib/data/email-templates";

export default async function EmailTemplatesSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const templates = await listEmailTemplates(workspace.id);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Email templates</h1>
        <p className="text-muted-foreground text-sm">
          Merge fields: {"{{person.name}}"}, {"{{organization.name}}"},{" "}
          {"{{deal.title}}"}.
        </p>
      </div>

      <EmailTemplateForm workspaceSlug={slug} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Templates</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
            >
              <span>
                {t.name} <span className="text-muted-foreground">— {t.subject}</span>
              </span>
              <DeleteEmailTemplateButton id={t.id} workspaceSlug={slug} />
            </div>
          ))}
          {templates.length === 0 ? (
            <p className="text-muted-foreground text-sm">No templates yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
