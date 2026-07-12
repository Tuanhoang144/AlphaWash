"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { ServicePerformance } from "../types/dashboard";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

function formatVND(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString();
}

interface Props {
  data: ServicePerformance;
}

export default function ServicePerformancePanel({ data }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Hiệu Suất Dịch Vụ</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Top dịch vụ (số lượng)</h3>
            <div className="rounded-lg bg-blue-500/10 px-2.5 py-1">
              <span className="text-xs font-medium text-blue-500">Attach rate: {data.productAttachRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="space-y-2">
            {data.topByCount.slice(0, 7).map((s, i) => {
              const maxCount = data.topByCount[0]?.count || 1;
              return (
                <div key={s.serviceCode} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{s.serviceName}</span>
                    <span className="shrink-0 font-semibold">{s.count} lần</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Top dịch vụ (doanh thu)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data.topByRevenue.slice(0, 7)}
              layout="vertical"
              margin={{ top: 0, right: 5, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis type="number" tickFormatter={formatVND} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis
                type="category"
                dataKey="serviceName"
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
                width={110}
              />
              <Tooltip formatter={(v) => formatVND(Number(v)) + " đ"} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold">Phân bổ loại dịch vụ</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {data.categoryDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatVND(Number(v)) + " đ"} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-2">
              {data.categoryDistribution.map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                    <span className="text-sm font-semibold">{formatVND(cat.revenue)} đ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
