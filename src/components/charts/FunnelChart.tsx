"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { funnel, lostByPriorStage } from "@/lib/aggregations";
import { statusLabel } from "@/lib/format";
import type { Lead } from "@/lib/types";
import { Card } from "../ui/Card";
import { useChartTheme } from "../ui/ThemeProvider";

const COLORS = ["#7dd3c0", "#6ea8fe", "#c4b5fd", "#f5b942", "#fb923c", "#3ecf8e"];

export function FunnelChart({
  leads,
  periodLabel,
}: {
  leads: Lead[];
  periodLabel?: string;
}) {
  const tip = useChartTheme();
  const rows = funnel(leads);
  const drops = lostByPriorStage(leads);
  const neverContacted = drops.find((d) => d.stage === "new")?.count ?? 0;
  const lost = leads.filter((l) => l.status === "lost").length;
  const scope = periodLabel ? `Of leads created in ${periodLabel}` : "Of leads created in this period";
  const soWhat =
    lost > 0 && neverContacted / lost >= 0.3
      ? `${scope}, ${neverContacted} of ${lost} losses never got a first contact — the leak is at the top.`
      : `${scope}, ${rows[rows.length - 1]?.reached ?? 0} of ${rows[0]?.reached ?? 0} reached delivery.`;

  const data = rows.map((r) => ({
    name: statusLabel(r.stage),
    reached: r.reached,
    drop: r.dropped,
  }));

  return (
    <Card title="Intake funnel" soWhat={soWhat}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12, top: 4, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={96} tickLine={false} axisLine={false} tick={{ fill: tip.muted, fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: tip.background, border: tip.border, borderRadius: tip.borderRadius, color: tip.color }}
              formatter={(value, name) => [String(value), name === "reached" ? "Reached stage" : "Dropped"]}
            />
            <Bar dataKey="reached" radius={[0, 8, 8, 0]} barSize={16}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
