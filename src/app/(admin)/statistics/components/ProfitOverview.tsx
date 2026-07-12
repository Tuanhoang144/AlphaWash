"use client";

import { ArrowRight } from "lucide-react";
import type { ProfitDashboard } from "../types/dashboard";

function formatVND(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString("en-US");
}

interface Props {
  data: ProfitDashboard;
}

export default function ProfitOverview({ data }: Props) {
  const items = [
    { label: "Tổng doanh thu", value: data.totalRevenue, color: "text-blue-500" },
    { label: "DT Dịch vụ", value: data.serviceRevenue, color: "text-violet-500" },
    { label: "DT Sản phẩm", value: data.productRevenue, color: "text-cyan-500" },
    { label: "Chi phí sản phẩm", value: data.totalCost, color: "text-red-500" },
    { label: "Lợi nhuận gộp", value: data.grossProfit, color: "text-emerald-500" },
    { label: "Tiền tip", value: data.tipTotal, color: "text-amber-500" },
  ];

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tổng Quan Lợi Nhuận</h3>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5">
          <span className="text-xs font-medium text-emerald-500">Biên LN</span>
          <span className="text-sm font-bold text-emerald-500">{data.profitMargin.toFixed(1)}%</span>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${item.color.replace("text-", "bg-")}`} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
            <span className={`text-sm font-semibold ${item.color}`}>
              {formatVND(item.value)} đ
            </span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Doanh thu</span>
            <ArrowRight className="h-3 w-3" />
            <span>Trừ chi phí</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-medium text-emerald-500">Lợi nhuận</span>
          </div>
        </div>
      </div>
    </div>
  );
}
