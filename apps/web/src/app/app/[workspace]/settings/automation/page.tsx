import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutomationRuleForm } from "@/components/app/automation-rule-form";
import {
  AutomationRuleToggle,
  DeleteAutomationRuleButton,
} from "@/components/app/automation-rule-row-actions";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getDefaultPipeline, getPipelineWithStages } from "@/lib/data/pipelines";
import { listActivityTypes } from "@/lib/data/activity-types";
import { listEmailTemplates } from "@/lib/data/email-templates";
import { listAutomationRules } from "@/lib/data/automation-rules";

const TRIGGER_LABELS: Record<string, string> = {
  deal_stage_changed: "Deal moves to stage",
  deal_won: "Deal is won",
  deal_lost: "Deal is lost",
};

export default async function AutomationSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const defaultPipeline = await getDefaultPipeline(workspace.id);
  const pipeline = defaultPipeline
    ? await getPipelineWithStages(workspace.id, defaultPipeline.id)
    : null;

  const [activityTypes, emailTemplates, rules] = await Promise.all([
    listActivityTypes(workspace.id),
    listEmailTemplates(workspace.id),
    listAutomationRules(workspace.id),
  ]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Automation</h1>
        <p className="text-muted-foreground text-sm">
          Trigger → condition → action rules for deals in your default
          pipeline ({pipeline?.name ?? "none configured"}).
        </p>
      </div>

      <AutomationRuleForm
        workspaceSlug={slug}
        stages={pipeline?.stages ?? []}
        activityTypes={activityTypes}
        emailTemplates={emailTemplates}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rules</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
            >
              <span className="flex items-center gap-2">
                <AutomationRuleToggle
                  id={rule.id}
                  workspaceSlug={slug}
                  isActive={rule.is_active}
                />
                {rule.name}{" "}
                <span className="text-muted-foreground">
                  ({TRIGGER_LABELS[rule.trigger_type] ?? rule.trigger_type})
                </span>
              </span>
              <DeleteAutomationRuleButton id={rule.id} workspaceSlug={slug} />
            </div>
          ))}
          {rules.length === 0 ? (
            <p className="text-muted-foreground text-sm">No rules yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
