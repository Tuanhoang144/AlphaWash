"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Car,
  BarChart3,
  Percent,
  Wallet,
} from "lucide-react";
import type { KpiSummary } from "../types/dashboard";
import MiniSparkline from "./MiniSparkline";

function formatVND(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString("en-US");
}

function calcChange(current: number, previous: number): { value: string; positive: boolean } {
  if (previous === 0) return { value: current > 0 ? "+100%" : "0%", positive: current >= 0 };
  const pct = ((current - previous) / previous) * 100;
  return {
    value: (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%",
    positive: pct >= 0,
  };
}

interface KpiCardProps {
  title: string;
  value: string;
  change: { value: string; positive: boolean };
  icon: React.ReactNode;
  sparkline?: number[];
  sparkColor?: string;
  subtitle?: string;
}

function KpiCard({ title, value, change, icon, sparkline, sparkColor, subtitle }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <div className="flex items-center gap-1.5">
            {change.positive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={`text-xs font-semibold ${change.positive ? "text-emerald-500" : "text-red-500"}`}>
              {change.value}
            </span>
            {subtitle && <span className="text-xs text-muted-foreground">vs trước</span>}
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      {sparkline && sparkline.length > 0 && (
        <div className="mt-3">
          <MiniSparkline data={sparkline} color={sparkColor} height={36} />
        </div>
      )}
    </div>
  );
}

interface Props {
  data: KpiSummary;
}

export default function KpiCards({ data }: Props) {
  const cards: KpiCardProps[] = [
    {
      title: "Doanh thu hôm nay",
      value: formatVND(data.todayRevenue) + " đ",
      change: calcChange(data.todayRevenue, data.yesterdayRevenue),
      icon: <DollarSign className="h-5 w-5" />,
      sparkline: data.revenueSparkline,
      sparkColor: "#3b82f6",
      subtitle: "hôm qua",
    },
    {
      title: "Doanh thu kỳ",
      value: formatVND(data.periodRevenue) + " đ",
      change: calcChange(data.periodRevenue, data.comparePeriodRevenue),
      icon: <Wallet className="h-5 w-5" />,
      sparkline: data.revenueSparkline,
      sparkColor: "#8b5cf6",
      subtitle: "kỳ trước",
    },
    {
      title: "Lợi nhuận kỳ",
      value: formatVND(data.periodProfit) + " đ",
      change: calcChange(data.periodProfit, data.comparePeriodProfit),
      icon: <BarChart3 className="h-5 w-5" />,
      sparkColor: "#10b981",
      subtitle: "kỳ trước",
    },
    {
      title: "Biên lợi nhuận",
      value: data.profitMargin.toFixed(1) + "%",
      change: calcChange(data.profitMargin, data.compareProfitMargin),
      icon: <Percent className="h-5 w-5" />,
      subtitle: "kỳ trước",
    },
    {
      title: "Số hóa đơn",
      value: data.periodInvoices.toLocaleString(),
      change: calcChange(data.periodInvoices, data.comparePeriodInvoices),
      icon: <Receipt className="h-5 w-5" />,
      subtitle: "kỳ trước",
    },
    {
      title: "Xe phục vụ",
      value: data.periodVehicles.toLocaleString(),
      change: calcChange(data.periodVehicles, data.comparePeriodVehicles),
      icon: <Car className="h-5 w-5" />,
      subtitle: "kỳ trước",
    },
    {
      title: "TB/Hóa đơn",
      value: formatVND(data.avgInvoiceValue) + " đ",
      change: calcChange(data.avgInvoiceValue, data.compareAvgInvoiceValue),
      icon: <Receipt className="h-5 w-5" />,
      subtitle: "kỳ trước",
    },
    {
      title: "Chi phí kỳ",
      value: formatVND(data.periodCost) + " đ",
      change: { value: "", positive: true },
      icon: <DollarSign className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  );
}
