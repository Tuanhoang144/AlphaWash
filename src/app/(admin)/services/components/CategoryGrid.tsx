"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Droplets, Sofa, Sparkles, Eye, Layers, Gift, MoreHorizontal } from "lucide-react";
import type { ServiceItem } from "@/types/Service";

export interface CategoryMeta {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;     // tailwind bg class (light)
  iconBg: string;    // tailwind bg class (icon circle)
  textColor: string; // tailwind text class
}

export const CATEGORY_META: CategoryMeta[] = [
  {
    key: "WASHING",
    label: "Rửa Xe",
    icon: <Droplets className="h-5 w-5" />,
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100 text-blue-600",
    textColor: "text-blue-700",
  },
  {
    key: "INTERIOR",
    label: "Nội Thất",
    icon: <Sofa className="h-5 w-5" />,
    color: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-600",
    textColor: "text-emerald-700",
  },
  {
    key: "POLISHING",
    label: "Đánh Bóng",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100 text-amber-600",
    textColor: "text-amber-700",
  },
  {
    key: "GLASS",
    label: "Kính Xe",
    icon: <Eye className="h-5 w-5" />,
    color: "bg-cyan-50 border-cyan-100",
    iconBg: "bg-cyan-100 text-cyan-600",
    textColor: "text-cyan-700",
  },
  {
    key: "PPF",
    label: "Dán PPF",
    icon: <Layers className="h-5 w-5" />,
    color: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-100 text-purple-600",
    textColor: "text-purple-700",
  },
  {
    key: "COMBO",
    label: "Combo",
    icon: <Gift className="h-5 w-5" />,
    color: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100 text-orange-600",
    textColor: "text-orange-700",
  },
  {
    key: "OTHER",
    label: "Khác",
    icon: <MoreHorizontal className="h-5 w-5" />,
    color: "bg-slate-50 border-slate-100",
    iconBg: "bg-slate-100 text-slate-600",
    textColor: "text-slate-700",
  },
];

export function getCategoryLabel(key: string): string {
  return CATEGORY_META.find((c) => c.key === key)?.label ?? key;
}

interface CategoryGridProps {
  categories: string[];
  services: ServiceItem[];
  onSelectCategory: (category: string) => void;
}

export function CategoryGrid({ categories, services, onSelectCategory }: CategoryGridProps) {
  // Build count map
  const countMap: Record<string, number> = {};
  for (const svc of services) {
    countMap[svc.category] = (countMap[svc.category] ?? 0) + 1;
  }

  // Merge BE categories with meta — show all from BE, fallback for unknown
  const displayed = categories.map((key) => {
    const meta = CATEGORY_META.find((m) => m.key === key);
    return meta ?? {
      key,
      label: key,
      icon: <MoreHorizontal className="h-5 w-5" />,
      color: "bg-slate-50 border-slate-100",
      iconBg: "bg-slate-100 text-slate-600",
      textColor: "text-slate-700",
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Danh Mục Dịch Vụ</h2>
        <p className="text-sm text-muted-foreground">{displayed.length} danh mục</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayed.map((meta) => {
          const count = countMap[meta.key] ?? 0;
          const activeCount = services.filter(
            (s) => s.category === meta.key && s.active
          ).length;

          return (
            <Card
              key={meta.key}
              className={`border ${meta.color} transition-shadow hover:shadow-md cursor-pointer`}
              onClick={() => onSelectCategory(meta.key)}
            >
              <CardContent className="p-5 space-y-4">
                {/* Icon + badge */}
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-2.5 ${meta.iconBg}`}>
                    {meta.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {count} dịch vụ
                  </Badge>
                </div>

                {/* Label */}
                <div>
                  <p className={`font-semibold text-base ${meta.textColor}`}>{meta.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeCount} đang hoạt động · {count - activeCount} ẩn
                  </p>
                </div>

                {/* CTA */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-between px-0 ${meta.textColor} hover:bg-transparent hover:opacity-70`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCategory(meta.key);
                  }}
                >
                  <span className="text-xs font-medium">Xem danh sách</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {displayed.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
            Không có danh mục nào
          </div>
        )}
      </div>
    </div>
  );
}
