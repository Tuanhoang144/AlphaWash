"use client";

import { AlertTriangle, AlertCircle, Info, Bell } from "lucide-react";
import type { Alert } from "../types/dashboard";

const severityConfig: Record<string, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
  critical: {
    icon: <AlertCircle className="h-4 w-4" />,
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    text: "text-red-500",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    text: "text-amber-500",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-500",
  },
};

interface Props {
  data: Alert[];
}

export default function AlertsPanel({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-bold">Cảnh Báo</h2>
        </div>
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          Không có cảnh báo nào
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold">Cảnh Báo</h2>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
          {data.length}
        </span>
      </div>
      <div className="space-y-2">
        {data.map((alert, i) => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          return (
            <div
              key={alert.type + i}
              className={`flex items-start gap-3 rounded-xl border p-4 ${config.bg} ${config.border}`}
            >
              <div className={`mt-0.5 ${config.text}`}>{config.icon}</div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
              {alert.count > 0 && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${config.text} ${config.bg}`}>
                  {alert.count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
