"use client";

import { Trophy, Medal } from "lucide-react";
import type { EmployeePerformanceItem } from "../types/dashboard";

function formatVND(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString("en-US");
}

interface Props {
  data: EmployeePerformanceItem[];
}

export default function EmployeeLeaderboard({ data }: Props) {
  const rankColors = [
    "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "bg-slate-400/10 text-slate-400 border-slate-400/20",
    "bg-orange-600/10 text-orange-600 border-orange-600/20",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold">Bảng Xếp Hạng Nhân Viên</h2>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nhân viên</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doanh thu</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hóa đơn</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">TB/HĐ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dịch vụ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sản phẩm</th>
              </tr>
            </thead>
            <tbody>
              {data.map((emp, i) => (
                <tr key={emp.employeeId} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    {i < 3 ? (
                      <div className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${rankColors[i]}`}>
                        {i + 1}
                      </div>
                    ) : (
                      <span className="pl-2 text-sm text-muted-foreground">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">{emp.employeeName}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-blue-500">{formatVND(emp.revenue)} đ</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">{emp.invoiceCount}</td>
                  <td className="px-4 py-3 text-right text-sm">{formatVND(emp.avgInvoice)} đ</td>
                  <td className="px-4 py-3 text-right text-sm">{emp.servicesSold}</td>
                  <td className="px-4 py-3 text-right text-sm">{emp.productsSold}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Chưa có dữ liệu nhân viên
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
