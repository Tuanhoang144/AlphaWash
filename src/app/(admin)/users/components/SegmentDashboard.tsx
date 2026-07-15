"use client";

import { useEffect } from "react";
import { useSegmentManager } from "@/services/useSegmentManager";
import { Users, TrendingUp, AlertTriangle, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function formatVND(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString("en-US");
}

export default function SegmentDashboard() {
  const { dashboard, loading, getDashboard } = useSegmentManager();

  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

  if (loading && !dashboard) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
        {dashboard.segments.map((s) => (
          <div
            key={s.code}
            className="rounded-xl border bg-card p-4 space-y-2 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: `${s.color}15`,
                  color: s.color,
                  border: `1px solid ${s.color}30`,
                }}
              >
                {s.segmentName}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{s.customerCount}</span>
              <span className="text-xs text-muted-foreground mb-1">khách hàng</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-semibold">Top Chi Tiêu</h3>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {dashboard.topSpenders.map((c, i) => (
              <div key={c.customerId} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
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
                  <p className="text-sm font-semibold">{formatVND(c.totalSpending)} đ</p>
                  <p className="text-xs text-muted-foreground">{c.visitCount} lần</p>
                </div>
              </div>
            ))}
            {dashboard.topSpenders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Khách Hàng Có Nguy Cơ Rời Bỏ</h3>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {dashboard.atRiskCustomers.map((c, i) => (
              <div key={c.customerId} className="flex items-center justify-between rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{c.customerName || "Khách lẻ"}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {c.phone}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatVND(c.totalSpending)} đ</p>
                  <p className="text-xs text-muted-foreground">{c.visitCount} lần ghé</p>
                </div>
              </div>
            ))}
            {dashboard.atRiskCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Không có khách hàng có nguy cơ</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
