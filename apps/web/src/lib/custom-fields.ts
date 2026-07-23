import type { Json } from "@crm/shared";
import type { FieldDefinitionRow } from "@/lib/data/fields";

/** Custom field inputs are named `cf__<key>` in forms; this reassembles them
 * into the jsonb object stored on the entity row, coercing per field_type. */
export function parseCustomFieldsFromFormData(
  formData: FormData,
  fieldDefs: FieldDefinitionRow[],
): Record<string, Json> {
  const result: Record<string, Json> = {};

  for (const def of fieldDefs) {
    const name = `cf__${def.key}`;

    switch (def.field_type) {
      case "checkbox":
        result[def.key] = formData.get(name) === "on";
        break;
      case "multiselect":
        result[def.key] = formData
          .getAll(name)
          .filter((v): v is string => typeof v === "string");
        break;
      case "number":
      case "currency": {
        const raw = formData.get(name);
        result[def.key] =
          typeof raw === "string" && raw !== "" ? Number(raw) : null;
        break;
      }
      default: {
        const raw = formData.get(name);
        result[def.key] = typeof raw === "string" && raw !== "" ? raw : null;
      }
    }
  }

  return result;
}

/** Same coercion as parseCustomFieldsFromFormData, but for a plain string
 * record (used by CSV import, where every cell arrives as a string). */
export function parseCustomFieldsFromRecord(
  record: Record<string, string>,
  fieldDefs: FieldDefinitionRow[],
): Record<string, Json> {
  const result: Record<string, Json> = {};

  for (const def of fieldDefs) {
    const raw = record[def.key];
    if (raw === undefined) continue;

    switch (def.field_type) {
      case "checkbox":
        result[def.key] = ["true", "1", "yes", "on"].includes(
          raw.trim().toLowerCase(),
        );
        break;
      case "multiselect":
        result[def.key] = raw
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "number":
      case "currency":
        result[def.key] = raw !== "" ? Number(raw) : null;
        break;
      default:
        result[def.key] = raw !== "" ? raw : null;
    }
  }

  return result;
}
