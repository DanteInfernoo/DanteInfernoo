"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueByMonthChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) =>
            Number(value).toLocaleString(undefined, { style: "currency", currency: "USD" })
          }
        />
        <Bar dataKey="revenue" fill="var(--color-primary, #3b82f6)" radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}
