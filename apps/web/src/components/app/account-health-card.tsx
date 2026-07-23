import { computeAccountHealth } from "@crm/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountHealthCard({
  orders,
}: {
  orders: { order_date: string; total: number }[];
}) {
  const health = computeAccountHealth(orders);

  if (health.orderCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Account health
          {health.isAtRisk ? (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              At risk
            </span>
          ) : null}
          {health.isGoneQuiet ? (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800 dark:bg-red-950 dark:text-red-300">
              Gone quiet
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
        <div>
          <p className="text-muted-foreground text-xs">First order</p>
          <p>{new Date(health.firstOrderDate!).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Last order</p>
          <p>{new Date(health.lastOrderDate!).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Order frequency</p>
          <p>{health.avgCycleDays ? `${health.avgCycleDays.toFixed(0)}d` : "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Avg order value</p>
          <p>${health.avgOrderValue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Lifetime value</p>
          <p>${health.lifetimeValue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Last 30 / 90 days</p>
          <p>
            ${health.revenue30d.toFixed(0)} / ${health.revenue90d.toFixed(0)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
