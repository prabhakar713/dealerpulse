"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AgingBucket } from "@/lib/aggregations";
import { formatINR } from "@/lib/format";
import { Card } from "../ui/Card";
import { useChartTheme } from "../ui/ThemeProvider";

const COLORS = ["#3ecf8e", "#7dd3c0", "#f5b942", "#fb923c", "#f07167"];

export function AgingChart({ buckets }: { buckets: AgingBucket[] }) {
  const tip = useChartTheme();
  const hot = buckets.filter((b) => b.min >= 7).reduce((s, b) => s + b.count, 0);
  const soWhat =
    hot > 0
      ? `${hot} open deals have had no activity for 7+ days. Treat anything past 7d as a follow-up failure.`
      : "Open deals are being worked inside a weekly cadence.";

  return (
    <Card title="Open-lead aging" soWhat={soWhat}>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: tip.muted, fontSize: 11 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={{ fill: tip.muted, fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: tip.background, border: tip.border, borderRadius: tip.borderRadius, color: tip.color }}
              formatter={(value, _n, item) => {
                const bucket = item.payload as AgingBucket;
                return [`${value} leads · ${formatINR(bucket.value)}`, "Open"];
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {buckets.map((b, i) => (
                <Cell key={b.key} fill={COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
