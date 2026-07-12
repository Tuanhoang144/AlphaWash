"use client";

import { Car, CheckCircle, Clock, Wrench } from "lucide-react";
import type { WorkshopOperations } from "../types/dashboard";

interface Props {
  data: WorkshopOperations;
}

export default function WorkshopOperationsPanel({ data }: Props) {
  const cards = [
    {
      label: "Xe đang làm",
      value: data.vehiclesInShop,
      icon: <Car className="h-5 w-5" />,
      color: "bg-blue-500/10 text-blue-500",
      pulse: data.vehiclesInShop > 0,
    },
    {
      label: "Hoàn thành hôm nay",
      value: data.completedToday,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "Đơn hàng hôm nay",
      value: data.todayOrders,
      icon: <Wrench className="h-5 w-5" />,
      color: "bg-violet-500/10 text-violet-500",
    },
    {
      label: "TB thời gian xử lý",
      value: data.avgTurnaroundMinutes > 0 ? Math.round(data.avgTurnaroundMinutes) + " phút" : "—",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-amber-500/10 text-amber-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Wrench className="h-5 w-5 text-violet-500" />
          {data.vehiclesInShop > 0 && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </div>
        <h2 className="text-lg font-bold">Xưởng</h2>
        <span className="text-xs text-muted-foreground">(Hôm nay - realtime)</span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`inline-flex items-center justify-center rounded-lg p-2 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
