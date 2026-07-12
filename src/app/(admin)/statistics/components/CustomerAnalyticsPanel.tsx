"use client";

import { Users, UserPlus, UserCheck, Heart, Phone } from "lucide-react";
import type { CustomerAnalytics } from "../types/dashboard";

function formatVND(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString("en-US");
}

interface Props {
  data: CustomerAnalytics;
}

export default function CustomerAnalyticsPanel({ data }: Props) {
  const metrics = [
    { label: "Tổng KH hoạt động", value: data.totalCustomers.toString(), icon: <Users className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-500" },
    { label: "KH mới", value: data.newCustomers.toString(), icon: <UserPlus className="h-4 w-4" />, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "KH quay lại", value: data.returningCustomers.toString(), icon: <UserCheck className="h-4 w-4" />, color: "bg-violet-500/10 text-violet-500" },
    { label: "Tỉ lệ giữ chân", value: data.retentionRate.toFixed(1) + "%", icon: <Heart className="h-4 w-4" />, color: "bg-pink-500/10 text-pink-500" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Khách Hàng</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${m.color}`}>
              {m.icon}
              {m.label}
            </div>
            <p className="text-xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold">Chi tiêu trung bình</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">TB/khách (kỳ này)</span>
              <span className="text-sm font-semibold">{formatVND(data.avgSpending)} đ</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Giá trị trọn đời</span>
              <span className="text-sm font-semibold">{formatVND(data.avgLifetimeValue)} đ</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">TB số lần ghé</span>
              <span className="text-sm font-semibold">{data.avgVisitFrequency.toFixed(1)} lần</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold">Top 10 VIP</h3>
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {data.topCustomers.map((c, i) => (
              <div key={c.phone + i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.customerName || "Khách lẻ"}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {c.phone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatVND(c.totalSpent)} đ</p>
                  <p className="text-xs text-muted-foreground">{c.visitCount} lần</p>
                </div>
              </div>
            ))}
            {data.topCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
