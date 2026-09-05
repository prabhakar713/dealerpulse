"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../ui/Card";
import { useChartTheme } from "../ui/ThemeProvider";

export function ReasonBars({
  title,
  soWhat,
  rows,
}: {
  title: string;
  soWhat: string;
  rows: { reason: string; count: number }[];
}) {
  const tip = useChartTheme();
  const data = rows.slice(0, 8).map((r) => ({
    name: r.reason.length > 28 ? `${r.reason.slice(0, 26)}…` : r.reason,
    count: r.count,
  }));

  return (
    <Card title={title} soWhat={soWhat}>
      {data.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted">No reasons recorded in this slice.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12, top: 4, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tick={{ fill: tip.muted, fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: tip.background, border: tip.border, borderRadius: tip.borderRadius, color: tip.color }}
              />
              <Bar dataKey="count" fill="#f07167" radius={[0, 8, 8, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
