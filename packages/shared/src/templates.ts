export type TemplateContext = Record<string, Record<string, unknown> | undefined>;

/** Replaces {{entity.field}} tokens (e.g. {{person.name}}, {{deal.title}})
 * with values from context. Unknown tokens are left blank rather than
 * throwing, since a template may reference a field the current entity
 * doesn't have linked (e.g. {{deal.title}} when logging against a person
 * with no deal). */
export function renderTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{\{\s*([\w]+)\.([\w]+)\s*\}\}/g, (_match, entity, field) => {
    const value = context[entity]?.[field];
    return value === null || value === undefined ? "" : String(value);
  });
}
