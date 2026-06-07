"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  X,
} from "lucide-react";
import type {
  DateFilterType,
  DateRange,
} from "@/shared/hooks/order/useBulkPayment";

// ============================================================================
// PROPS
// ============================================================================

interface BulkPaymentBarProps {
  selectedCount: number;
  selectedTotalPrice: number;
  dateFilter: DateFilterType;
  customRange: DateRange;
  onDateFilterChange: (filter: DateFilterType) => void;
  onCustomRangeChange: (range: DateRange) => void;
  onMarkAsPaid: () => void;
  onClearSelection: () => void;
}

// ============================================================================
// HELPER - Date Filter Labels
// ============================================================================

const dateFilterLabels: Record<string, string> = {
  today: "Hôm nay",
  week: "Tuần này",
  month: "Tháng này",
  custom: "Tùy chỉnh",
};

// ============================================================================
// COMPONENT
// ============================================================================

const BulkPaymentBar: React.FC<BulkPaymentBarProps> = ({
  selectedCount,
  selectedTotalPrice,
  dateFilter,
  customRange,
  onDateFilterChange,
  onCustomRangeChange,
  onMarkAsPaid,
  onClearSelection,
}) => {
  const [tempFrom, setTempFrom] = useState(customRange.from);
  const [tempTo, setTempTo] = useState(customRange.to);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const handleApplyCustomRange = () => {
    if (tempFrom && tempTo) {
      onCustomRangeChange({ from: tempFrom, to: tempTo });
      setIsCustomOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mx-4 mt-3">
      {/* Date Filter */}
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-blue-600" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 bg-white">
              <Calendar className="mr-2 h-3.5 w-3.5" />
              {dateFilter ? dateFilterLabels[dateFilter] : "Lọc ngày"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onDateFilterChange("today")}>
              Hôm nay
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange("week")}>
              Tuần này
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange("month")}>
              Tháng này
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIsCustomOpen(true);
              }}
            >
              Tùy chỉnh...
            </DropdownMenuItem>
            {dateFilter && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDateFilterChange(null)}>
                  <X className="mr-2 h-3.5 w-3.5" />
                  Xóa bộ lọc
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Custom Date Range Popover */}
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <span />
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Chọn khoảng thời gian</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Từ ngày</label>
                  <Input
                    type="date"
                    value={tempFrom}
                    onChange={(e) => setTempFrom(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <span className="text-gray-400 mt-5">→</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Đến ngày</label>
                  <Input
                    type="date"
                    value={tempTo}
                    onChange={(e) => setTempTo(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyCustomRange}
                  disabled={!tempFrom || !tempTo}
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-blue-200 hidden sm:block" />

      {/* Selection Info & Actions */}
      <div className="flex flex-1 items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <>
              <span className="text-sm font-medium text-blue-700">
                Đã chọn: {selectedCount} hóa đơn
              </span>
              <span className="text-sm text-blue-600">
                Tổng:{" "}
                <span className="font-semibold">
                  {selectedTotalPrice.toLocaleString("vi-VN")} VNĐ
                </span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-gray-600"
              onClick={onClearSelection}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Bỏ chọn
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 bg-green-600 hover:bg-green-700 text-white"
            onClick={onMarkAsPaid}
            disabled={selectedCount === 0}
          >
            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
            Đánh dấu đã thanh toán ({selectedCount})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkPaymentBar;
