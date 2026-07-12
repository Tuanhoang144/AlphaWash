"use client";

import {
  AreaChart,
  Area,
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
  Legend,
} from "recharts";
import type { RevenueDashboard } from "../types/dashboard";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

function formatVND(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString();
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {formatVND(p.value)} đ
        </p>
      ))}
    </div>
  );
};

interface Props {
  data: RevenueDashboard;
}

export default function RevenueCharts({ data }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Doanh Thu</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Doanh thu theo ngày">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.revenueByDay} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickFormatter={formatVND}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doanh thu theo tháng">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.revenueByMonth} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickFormatter={formatVND}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doanh thu theo loại dịch vụ">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.revenueByCategory}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {data.revenueByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatVND(Number(value)) + " đ"}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doanh thu theo phương thức thanh toán">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data.revenueByPaymentMethod}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis type="number" tickFormatter={formatVND} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis
                type="category"
                dataKey="method"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" name="Doanh thu" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doanh thu theo nhân viên">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data.revenueByEmployee.slice(0, 8)}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis type="number" tickFormatter={formatVND} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis
                type="category"
                dataKey="employeeName"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
