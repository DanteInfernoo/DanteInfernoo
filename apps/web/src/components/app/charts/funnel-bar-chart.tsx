"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function FunnelBarChart({
  data,
}: {
  data: { stage: string; count: number; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="stage" width={100} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) =>
            name === "value"
              ? Number(value).toLocaleString(undefined, { style: "currency", currency: "USD" })
              : value
          }
        />
        <Bar dataKey="count" name="deals" fill="var(--color-primary, #3b82f6)" radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}
