"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CustomerDetail } from "@/types/Customer";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const compactCurrency = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}tr` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k` : String(v);

export function StatsTab({ customer }: { customer: CustomerDetail }) {
  const { stats } = customer;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Chi tiêu theo tháng
        </h4>
        {stats.spendingByMonth.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
        ) : (
          <div className="h-56 rounded-xl border bg-card p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.spendingByMonth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={compactCurrency} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => currency.format(Number(value))} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Dịch vụ đã sử dụng
        </h4>
        <div className="space-y-2">
          {stats.serviceBreakdown.map((s) => (
            <div
              key={s.serviceName}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{s.serviceName}</p>
                <p className="text-xs text-muted-foreground">{s.count} lần</p>
              </div>
              <span className="font-medium">{currency.format(s.total)}</span>
            </div>
          ))}
          {stats.serviceBreakdown.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  );
}
