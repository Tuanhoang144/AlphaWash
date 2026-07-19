"use client";

import { useRouter } from "next/navigation";
import {
  Copy,
  Download,
  Link2,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CustomerQuickSegment } from "@/types/Customer";

const QUICK_SEGMENTS: { value: CustomerQuickSegment | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "VIP", label: "VIP" },
  { value: "NEW", label: "Mới (< 30 ngày)" },
  { value: "INACTIVE", label: "Không hoạt động" },
];

interface CustomerToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  quickSegment: CustomerQuickSegment | "ALL";
  onQuickSegmentChange: (value: CustomerQuickSegment | "ALL") => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  onAddCustomer: () => void;
  onExport: () => void;
  onRefresh: () => void;
  onAutoLink: () => void;
  exporting: boolean;
  loading: boolean;
}

export function CustomerToolbar({
  search,
  onSearchChange,
  quickSegment,
  onQuickSegmentChange,
  activeFilterCount,
  onOpenFilters,
  onAddCustomer,
  onExport,
  onRefresh,
  onAutoLink,
  exporting,
  loading,
}: CustomerToolbarProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold">Quản lý Khách Hàng</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/customers/segments")}>
            <Tags className="size-4" /> Phân khúc
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/duplicate-vehicles")}>
            <Copy className="size-4" /> Xe trùng lặp
          </Button>
          <Button variant="outline" size="sm" onClick={onAutoLink}>
            <Link2 className="size-4" /> Liên kết xe hàng loạt
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} disabled={exporting}>
            <Download className="size-4" /> Xuất CSV
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </Button>
          <Button size="sm" onClick={onAddCustomer}>
            <Plus className="size-4" /> Thêm khách hàng
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, SĐT, biển số..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button variant="outline" size="sm" onClick={onOpenFilters} className="relative">
          <SlidersHorizontal className="size-4" /> Bộ lọc
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_SEGMENTS.map((seg) => (
            <button
              key={seg.value}
              onClick={() => onQuickSegmentChange(seg.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                quickSegment === seg.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
