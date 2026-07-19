"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_CUSTOMER_FILTERS,
  type CustomerFilterValues,
  type CustomerSortField,
  type CustomerStatus,
} from "@/types/Customer";

const STATUS_OPTIONS: { value: CustomerStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Ngừng hoạt động" },
];

const VEHICLE_COUNT_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Bất kỳ" },
  { value: "0", label: "0 xe" },
  { value: "1", label: "1 xe" },
  { value: "2", label: "2+ xe" },
];

const SORT_OPTIONS: { value: CustomerSortField; label: string }[] = [
  { value: "name", label: "Tên" },
  { value: "totalSpending", label: "Tổng chi tiêu" },
  { value: "totalVisits", label: "Số lượt ghé" },
  { value: "lastVisitDate", label: "Ghé gần nhất" },
];

interface CustomerFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: CustomerFilterValues;
  onApply: (value: CustomerFilterValues) => void;
}

export function CustomerFilters({ open, onOpenChange, value, onApply }: CustomerFiltersProps) {
  const [draft, setDraft] = useState<CustomerFilterValues>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const set = <K extends keyof CustomerFilterValues>(key: K, v: CustomerFilterValues[K]) => {
    setDraft((prev) => ({ ...prev, [key]: v }));
  };

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_CUSTOMER_FILTERS);
    onApply(DEFAULT_CUSTOMER_FILTERS);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bộ lọc nâng cao</SheetTitle>
          <SheetDescription>Thu hẹp danh sách khách hàng theo tiêu chí.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Trạng thái</Label>
            <Select
              value={draft.status ?? "ALL"}
              onValueChange={(v) => set("status", v === "ALL" ? undefined : (v as CustomerStatus))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Ghé thăm lần cuối</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={draft.lastVisitFrom ?? ""}
                onChange={(e) => set("lastVisitFrom", e.target.value || undefined)}
              />
              <Input
                type="date"
                value={draft.lastVisitTo ?? ""}
                onChange={(e) => set("lastVisitTo", e.target.value || undefined)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Khoảng chi tiêu (VNĐ)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Từ"
                value={draft.minSpending ?? ""}
                onChange={(e) =>
                  set("minSpending", e.target.value ? Number(e.target.value) : undefined)
                }
              />
              <Input
                type="number"
                min={0}
                placeholder="Đến"
                value={draft.maxSpending ?? ""}
                onChange={(e) =>
                  set("maxSpending", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Số lượng xe</Label>
            <Select
              value={draft.vehicleCount != null ? String(draft.vehicleCount) : "ALL"}
              onValueChange={(v) => set("vehicleCount", v === "ALL" ? undefined : Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_COUNT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Sắp xếp theo</Label>
            <div className="flex gap-2">
              <Select
                value={draft.sortBy ?? "lastVisitDate"}
                onValueChange={(v) => set("sortBy", v as CustomerSortField)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => set("sortDir", draft.sortDir === "asc" ? "desc" : "asc")}
                title={draft.sortDir === "asc" ? "Tăng dần" : "Giảm dần"}
              >
                {draft.sortDir === "asc" ? (
                  <ArrowUp className="size-4" />
                ) : (
                  <ArrowDown className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Đặt lại
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Áp dụng
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
