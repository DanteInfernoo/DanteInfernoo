import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldDefinitionRow } from "@/lib/data/fields";

interface CustomFieldsFieldsetProps {
  fieldDefs: FieldDefinitionRow[];
  values?: Record<string, unknown> | null;
}

export function CustomFieldsFieldset({
  fieldDefs,
  values,
}: CustomFieldsFieldsetProps) {
  if (fieldDefs.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {fieldDefs.map((def) => {
        const name = `cf__${def.key}`;
        const current = values?.[def.key];
        const options = def.options as { value: string; label: string }[];

        return (
          <div key={def.id} className="flex flex-col gap-1.5">
            {def.field_type !== "checkbox" ? (
              <Label htmlFor={name}>
                {def.label}
                {def.is_required ? " *" : ""}
              </Label>
            ) : null}

            {def.field_type === "text" && (
              <Input
                id={name}
                name={name}
                defaultValue={typeof current === "string" ? current : ""}
                required={def.is_required}
              />
            )}
            {(def.field_type === "number" || def.field_type === "currency") && (
              <Input
                id={name}
                name={name}
                type="number"
                step="any"
                defaultValue={
                  typeof current === "number" ? String(current) : ""
                }
                required={def.is_required}
              />
            )}
            {def.field_type === "date" && (
              <Input
                id={name}
                name={name}
                type="date"
                defaultValue={typeof current === "string" ? current : ""}
                required={def.is_required}
              />
            )}
            {def.field_type === "checkbox" && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  id={name}
                  name={name}
                  type="checkbox"
                  defaultChecked={current === true}
                  className="size-4"
                />
                {def.label}
                {def.is_required ? " *" : ""}
              </label>
            )}
            {def.field_type === "dropdown" && (
              <select
                id={name}
                name={name}
                defaultValue={typeof current === "string" ? current : ""}
                required={def.is_required}
                className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
              >
                <option value="" />
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {def.field_type === "multiselect" && (
              <div className="flex flex-col gap-1">
                {options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name={name}
                      value={opt.value}
                      defaultChecked={
                        Array.isArray(current) && current.includes(opt.value)
                      }
                      className="size-4"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
