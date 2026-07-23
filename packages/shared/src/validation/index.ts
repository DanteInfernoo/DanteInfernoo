import { z } from "zod";

export const customFieldTypeSchema = z.enum([
  "text",
  "number",
  "date",
  "dropdown",
  "multiselect",
  "currency",
  "checkbox",
]);

export const customFieldOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  color: z.string().optional(),
});

export const customFieldDefinitionSchema = z
  .object({
    entity_type: z.string().min(1),
    key: z
      .string()
      .min(1)
      .regex(
        /^[a-z][a-z0-9_]*$/,
        "Use lowercase letters, numbers, and underscores, starting with a letter",
      ),
    label: z.string().min(1),
    field_type: customFieldTypeSchema,
    options: z.array(customFieldOptionSchema).default([]),
    is_required: z.boolean().default(false),
    sort_order: z.number().int().default(0),
  })
  .refine(
    (value) =>
      value.field_type !== "dropdown" && value.field_type !== "multiselect"
        ? true
        : value.options.length > 0,
    {
      message: "Dropdown and multi-select fields need at least one option",
      path: ["options"],
    },
  );

export type CustomFieldDefinitionInput = z.infer<
  typeof customFieldDefinitionSchema
>;

export const workspaceCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Lowercase letters, numbers, and hyphens only",
    ),
});

export type WorkspaceCreateInput = z.infer<typeof workspaceCreateSchema>;

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Name is required"),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const organizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;

export const personSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  organization_id: z.string().uuid().optional().or(z.literal("")),
});

export type PersonInput = z.infer<typeof personSchema>;

export const pipelineSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type PipelineInput = z.infer<typeof pipelineSchema>;

export const stageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  probability: z.coerce.number().int().min(0).max(100),
  rotten_days: z.coerce.number().int().positive().optional(),
});

export type StageInput = z.infer<typeof stageSchema>;

export const dealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.coerce.number().min(0).default(0),
  currency: z.string().min(1).default("USD"),
  organization_id: z.string().uuid().optional().or(z.literal("")),
  person_id: z.string().uuid().optional().or(z.literal("")),
  expected_close_date: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
});

export type DealInput = z.infer<typeof dealSchema>;

export const activityTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1).default("circle"),
  color: z.string().min(1).default("#6b7280"),
});

export type ActivityTypeInput = z.infer<typeof activityTypeSchema>;

export const recurrenceIntervalSchema = z.enum([
  "none",
  "daily",
  "weekly",
  "monthly",
]);

export const activitySchema = z.object({
  type_id: z.string().uuid(),
  subject: z.string().min(1, "Subject is required"),
  notes: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
  due_time: z.string().optional().or(z.literal("")),
  duration_minutes: z.coerce.number().int().positive().optional(),
  deal_id: z.string().uuid().optional().or(z.literal("")),
  person_id: z.string().uuid().optional().or(z.literal("")),
  organization_id: z.string().uuid().optional().or(z.literal("")),
  recurrence_interval: recurrenceIntervalSchema.default("none"),
  recurrence_until: z.string().optional().or(z.literal("")),
});

export type ActivityInput = z.infer<typeof activitySchema>;

export const noteSchema = z.object({
  body: z.string().min(1, "Note can't be empty"),
});

export type NoteInput = z.infer<typeof noteSchema>;

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

export const emailLogSchema = z.object({
  direction: z.enum(["outbound", "inbound"]).default("outbound"),
  subject: z.string().optional(),
  body: z.string().min(1, "Body is required"),
  from_address: z.string().optional(),
  to_addresses: z.string().optional(),
  sent_at: z.string().optional(),
  deal_id: z.string().uuid().optional().or(z.literal("")),
  person_id: z.string().uuid().optional().or(z.literal("")),
  organization_id: z.string().uuid().optional().or(z.literal("")),
});

export type EmailLogInput = z.infer<typeof emailLogSchema>;

export const automationTriggerTypeSchema = z.enum([
  "deal_stage_changed",
  "deal_won",
  "deal_lost",
]);

export const automationRuleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  trigger_type: automationTriggerTypeSchema,
  to_stage_id: z.string().uuid().optional().or(z.literal("")),
  condition_operator: z.enum(["gt", "gte", "lt", "lte", "eq"]).optional().or(z.literal("")),
  condition_value: z.coerce.number().optional(),
  activity_type_id: z.string().uuid().optional().or(z.literal("")),
  activity_subject: z.string().optional(),
  activity_due_in_days: z.coerce.number().int().positive().optional(),
  email_template_id: z.string().uuid().optional().or(z.literal("")),
});

export type AutomationRuleFormInput = z.infer<typeof automationRuleFormSchema>;

export const goalSchema = z.object({
  user_id: z.string().uuid().optional().or(z.literal("")),
  metric_type: z.enum(["revenue", "deals_won", "activities_completed"]),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM"),
  target_value: z.coerce.number().positive(),
});

export type GoalInput = z.infer<typeof goalSchema>;

export const labelSchema = z.object({
  entity_type: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1).default("#6b7280"),
});

export type LabelInput = z.infer<typeof labelSchema>;
