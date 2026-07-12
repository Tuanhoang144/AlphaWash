"use client";

import { Target } from "lucide-react";
import type { BusinessGoals, GoalProgress } from "../types/dashboard";

function formatVND(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString("en-US");
}

function GoalCard({ label, goal, unit, color }: { label: string; goal: GoalProgress; unit: string; color: string }) {
  const pct = Math.min(goal.percentage, 100);
  const isOnTrack = goal.percentage >= 50;

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{label}</h4>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          pct >= 80 ? "bg-emerald-500/10 text-emerald-500" :
          pct >= 50 ? "bg-amber-500/10 text-amber-500" :
          "bg-red-500/10 text-red-500"
        }`}>
          {pct.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-3 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatVND(goal.current)}{unit} / {formatVND(goal.target)}{unit}</span>
        <span>Còn {goal.daysLeft} ngày</span>
      </div>

      {goal.remaining > 0 && (
        <p className="text-xs text-muted-foreground">
          Cần thêm: <span className="font-medium text-foreground">{formatVND(goal.remaining)}{unit}</span>
        </p>
      )}
    </div>
  );
}

interface Props {
  data: BusinessGoals;
}

export default function BusinessGoalsPanel({ data }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-bold">Mục Tiêu Kinh Doanh</h2>
        <span className="text-xs text-muted-foreground">(Tháng này)</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GoalCard label="Doanh thu" goal={data.revenueGoal} unit=" đ" color="bg-blue-500" />
        <GoalCard label="Lợi nhuận" goal={data.profitGoal} unit=" đ" color="bg-emerald-500" />
        <GoalCard label="Số xe" goal={data.vehicleGoal} unit="" color="bg-violet-500" />
        <GoalCard label="Khách hàng" goal={data.customerGoal} unit="" color="bg-amber-500" />
      </div>
    </div>
  );
}
