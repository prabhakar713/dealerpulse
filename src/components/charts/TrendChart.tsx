"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyPoint } from "@/lib/aggregations";
import { formatINR, monthLabel } from "@/lib/format";
import { Card } from "../ui/Card";

export function TrendChart({ points }: { points: MonthlyPoint[] }) {
  const last = points[points.length - 1];
  const soWhat = last
    ? `${monthLabel(last.month)} delivered ${last.units} units vs a ${last.targetUnits} target (${Math.round(last.unitPct)}%). Bars are actuals; the line is the target.`
    : "No months in this range.";

  const data = points.map((p) => ({
    ...p,
    label: monthLabel(p.month).replace(" 2025", ""),
  }));

  return (
    <Card title="Units vs monthly target" soWhat={soWhat}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={36} />
            <Tooltip
              contentStyle={{ background: "#12151c", border: "1px solid #262c38", borderRadius: 12 }}
              formatter={(value, name) => {
                const n = Number(value ?? 0);
                if (name === "revenue" || name === "targetRevenue") return [formatINR(n), String(name)];
                return [n, String(name)];
              }}
            />
            <Bar dataKey="units" fill="#7dd3c0" radius={[6, 6, 0, 0]} name="Units" />
            <Line type="monotone" dataKey="targetUnits" stroke="#f5b942" strokeWidth={2} dot={false} name="Target units" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
