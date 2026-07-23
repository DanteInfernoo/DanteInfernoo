"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface ImportTargetField {
  key: string;
  label: string;
}

export function CsvImportForm({
  targetFields,
  onImport,
}: {
  targetFields: ImportTargetField[];
  onImport: (
    rows: Record<string, string>[],
  ) => Promise<{ error?: string; count?: number }>;
}) {
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ error?: string; count?: number } | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);

  function handleFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setColumns(results.meta.fields ?? []);
        setRows(results.data);
        setResult(null);
      },
    });
  }

  async function handleImport() {
    setIsPending(true);
    const mappedRows = rows.map((row) => {
      const mapped: Record<string, string> = {};
      for (const [csvColumn, targetKey] of Object.entries(mapping)) {
        if (targetKey) mapped[targetKey] = row[csvColumn] ?? "";
      }
      return mapped;
    });
    const outcome = await onImport(mappedRows);
    setResult(outcome);
    setIsPending(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="csv-file">CSV file</Label>
        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="text-sm"
        />
      </div>

      {columns.length > 0 ? (
        <>
          <div className="flex flex-col gap-2 rounded-lg border p-4">
            <p className="text-sm font-medium">Map columns</p>
            {columns.map((col) => (
              <div key={col} className="grid grid-cols-2 items-center gap-2">
                <span className="text-sm">{col}</span>
                <select
                  className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
                  value={mapping[col] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [col]: e.target.value }))
                  }
                >
                  <option value="">-- skip --</option>
                  {targetFields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-sm">
            {rows.length} row{rows.length === 1 ? "" : "s"} ready to import.
          </p>

          <Button
            type="button"
            onClick={handleImport}
            disabled={isPending}
            className="self-start"
          >
            {isPending ? "Importing..." : "Import"}
          </Button>
        </>
      ) : null}

      {result ? (
        <p className={result.error ? "text-destructive text-sm" : "text-sm"}>
          {result.error ?? `Imported ${result.count} rows.`}
        </p>
      ) : null}
    </div>
  );
}
