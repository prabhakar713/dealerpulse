"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../ui/Card";

export function ReasonBars({
  title,
  soWhat,
  rows,
}: {
  title: string;
  soWhat: string;
  rows: { reason: string; count: number }[];
}) {
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
              <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#12151c", border: "1px solid #262c38", borderRadius: 12 }}
              />
              <Bar dataKey="count" fill="#f07167" radius={[0, 8, 8, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
