export function GoalProgress({
  label,
  actual,
  target,
  isCurrency,
}: {
  label: string;
  actual: number;
  target: number;
  isCurrency?: boolean;
}) {
  const pct = target > 0 ? Math.min(100, (actual / target) * 100) : 0;
  const format = (n: number) =>
    isCurrency ? n.toLocaleString(undefined, { style: "currency", currency: "USD" }) : n.toString();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {format(actual)} / {format(target)}
        </span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
