import { notFound } from "next/navigation";
import { ModuleToggle } from "@/components/app/module-toggle";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

const MODULES = [
  {
    key: "products",
    label: "Products & Price Lists",
    description: "Product catalog, price lists, and per-account pricing.",
  },
  {
    key: "orders",
    label: "Orders",
    description: "Standing orders and repeat-purchase order tracking.",
  },
  {
    key: "samples",
    label: "Samples & Trials",
    description: "Track sample drops and conversion to first order.",
  },
  {
    key: "territories",
    label: "Territory & Delivery",
    description: "Delivery routes, territories, and distributor rollups.",
  },
];

export default async function ModulesSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const enabled = new Set((workspace.enabled_modules as string[] | null) ?? []);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Modules</h1>
        <p className="text-muted-foreground text-sm">
          Turn on the parts of this CRM that fit how your business sells.
          These are optional — a pure sales-pipeline workspace doesn't need
          any of them.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {MODULES.map((m) => (
          <ModuleToggle
            key={m.key}
            workspaceSlug={slug}
            moduleKey={m.key}
            label={m.label}
            description={m.description}
            enabled={enabled.has(m.key)}
          />
        ))}
      </div>
    </div>
  );
}
