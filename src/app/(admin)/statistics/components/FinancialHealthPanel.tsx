"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, Package, Wallet, TrendingDown } from "lucide-react";
import type { FinancialHealth } from "../types/dashboard";

function formatVND(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString("en-US");
}

interface Props {
  data: FinancialHealth;
}

export default function FinancialHealthPanel({ data }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Sức Khỏe Tài Chính</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div className="inline-flex items-center justify-center rounded-lg p-2 bg-red-500/10 text-red-500">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold">{formatVND(data.outstandingPayments)} đ</p>
            <p className="text-xs text-muted-foreground">Chưa thanh toán ({data.outstandingCount})</p>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div className="inline-flex items-center justify-center rounded-lg p-2 bg-blue-500/10 text-blue-500">
              <Package className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold">{formatVND(data.inventoryValue)} đ</p>
            <p className="text-xs text-muted-foreground">Giá trị tồn kho</p>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div className="inline-flex items-center justify-center rounded-lg p-2 bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold">{data.lowStockCount}</p>
            <p className="text-xs text-muted-foreground">Sắp hết hàng</p>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div className="inline-flex items-center justify-center rounded-lg p-2 bg-red-500/10 text-red-500">
              <TrendingDown className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold">{data.outOfStockCount}</p>
            <p className="text-xs text-muted-foreground">Hết hàng</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold">Dòng tiền hàng ngày</h3>
          {data.dailyCashFlow.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.dailyCashFlow} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={formatVND} width={55} />
                <Tooltip
                  formatter={(v) => formatVND(Number(v)) + " đ"}
                  labelFormatter={(l) => `Ngày: ${l}`}
                />
                <Bar dataKey="inflow" name="Thu" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
