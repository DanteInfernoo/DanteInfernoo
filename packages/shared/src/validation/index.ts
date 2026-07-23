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

export const labelSchema = z.object({
  entity_type: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1).default("#6b7280"),
});

export type LabelInput = z.infer<typeof labelSchema>;
