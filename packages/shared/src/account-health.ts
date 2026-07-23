export interface OrderForHealth {
  order_date: string;
  total: number;
}

export interface AccountHealth {
  firstOrderDate: string | null;
  lastOrderDate: string | null;
  orderCount: number;
  avgOrderValue: number;
  lifetimeValue: number;
  avgCycleDays: number | null; // average days between consecutive orders
  revenue30d: number;
  revenue90d: number;
  daysSinceLastOrder: number | null;
  isAtRisk: boolean; // no order in > 1.5x usual cycle
  isGoneQuiet: boolean; // no order in 90+ days with order history
}

export function computeAccountHealth(
  orders: OrderForHealth[],
  now: Date = new Date(),
): AccountHealth {
  const sorted = [...orders].sort(
    (a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime(),
  );

  if (sorted.length === 0) {
    return {
      firstOrderDate: null,
      lastOrderDate: null,
      orderCount: 0,
      avgOrderValue: 0,
      lifetimeValue: 0,
      avgCycleDays: null,
      revenue30d: 0,
      revenue90d: 0,
      daysSinceLastOrder: null,
      isAtRisk: false,
      isGoneQuiet: false,
    };
  }

  const lifetimeValue = sorted.reduce((s, o) => s + o.total, 0);
  const firstOrderDate = sorted[0].order_date;
  const lastOrderDate = sorted[sorted.length - 1].order_date;

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const days =
      (new Date(sorted[i].order_date).getTime() -
        new Date(sorted[i - 1].order_date).getTime()) /
      (1000 * 60 * 60 * 24);
    gaps.push(days);
  }
  const avgCycleDays =
    gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null;

  const daysSinceLastOrder =
    (now.getTime() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);

  const cutoff30 = new Date(now);
  cutoff30.setDate(cutoff30.getDate() - 30);
  const cutoff90 = new Date(now);
  cutoff90.setDate(cutoff90.getDate() - 90);

  const revenue30d = sorted
    .filter((o) => new Date(o.order_date) >= cutoff30)
    .reduce((s, o) => s + o.total, 0);
  const revenue90d = sorted
    .filter((o) => new Date(o.order_date) >= cutoff90)
    .reduce((s, o) => s + o.total, 0);

  const isAtRisk =
    avgCycleDays !== null && daysSinceLastOrder > avgCycleDays * 1.5;
  const isGoneQuiet = sorted.length > 0 && daysSinceLastOrder > 90;

  return {
    firstOrderDate,
    lastOrderDate,
    orderCount: sorted.length,
    avgOrderValue: lifetimeValue / sorted.length,
    lifetimeValue,
    avgCycleDays,
    revenue30d,
    revenue90d,
    daysSinceLastOrder,
    isAtRisk,
    isGoneQuiet,
  };
}
