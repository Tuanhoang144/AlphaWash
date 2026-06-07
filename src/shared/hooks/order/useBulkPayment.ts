"use client";

import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";
import { useOrderManager } from "@/services/useOrderManager";
import type { OrderResponseDTO } from "@/types/OrderResponse";
// Note: Uses dedicated bulk-payment endpoint (PATCH /orders/bulk-payment)

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DateFilterType = "today" | "week" | "month" | "custom" | null;

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

// ============================================================================
// HELPERS - Date Range Calculators
// ============================================================================

function getToday(): DateRange {
  const today = new Date().toISOString().split("T")[0];
  return { from: today, to: today };
}

function getThisWeek(): DateRange {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Monday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().split("T")[0],
    to: sunday.toISOString().split("T")[0],
  };
}

function getThisMonth(): DateRange {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: firstDay.toISOString().split("T")[0],
    to: lastDay.toISOString().split("T")[0],
  };
}

function isDateInRange(orderDate: string, range: DateRange): boolean {
  // orderDate may be "YYYY-MM-DD" or "YYYY-MM-DDT..."
  const date = orderDate.split("T")[0];
  return date >= range.from && date <= range.to;
}

// ============================================================================
// HOOK - useBulkPayment
// ============================================================================

export function useBulkPayment(
  allData: OrderResponseDTO[],
  onRefresh: () => Promise<void>
) {
  // =========================================================================
  // STATE
  // =========================================================================

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<DateFilterType>(null);
  const [customRange, setCustomRange] = useState<DateRange>({ from: "", to: "" });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { bulkUpdatePaymentStatus } = useOrderManager();

  // =========================================================================
  // COMPUTED - Filtered data for date range
  // =========================================================================

  const getDateRange = useCallback((): DateRange | null => {
    switch (dateFilter) {
      case "today":
        return getToday();
      case "week":
        return getThisWeek();
      case "month":
        return getThisMonth();
      case "custom":
        return customRange.from && customRange.to ? customRange : null;
      default:
        return null;
    }
  }, [dateFilter, customRange]);

  // Get unpaid orders (eligible for bulk payment)
  const unpaidOrders = useCallback((): OrderResponseDTO[] => {
    const range = getDateRange();
    return allData.filter((order) => {
      const isUnpaid = ["PENDING", "PROCESSING", "UNPAID"].includes(
        order.paymentStatus ?? ""
      );
      if (!isUnpaid) return false;
      if (range) return isDateInRange(order.date, range);
      return true;
    });
  }, [allData, getDateRange]);

  // =========================================================================
  // HANDLERS - Selection
  // =========================================================================

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(
    (filteredData: OrderResponseDTO[]) => {
      const unpaid = filteredData.filter((o) =>
        ["PENDING", "PROCESSING", "UNPAID"].includes(o.paymentStatus ?? "")
      );
      const allSelected = unpaid.length > 0 && unpaid.every((o) => selectedIds.has(o.id));

      if (allSelected) {
        // Deselect all unpaid in current view
        setSelectedIds((prev) => {
          const next = new Set(prev);
          unpaid.forEach((o) => next.delete(o.id));
          return next;
        });
      } else {
        // Select all unpaid in current view
        setSelectedIds((prev) => {
          const next = new Set(prev);
          unpaid.forEach((o) => next.add(o.id));
          return next;
        });
      }
    },
    [selectedIds]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // =========================================================================
  // HANDLERS - Date Filter
  // =========================================================================

  const handleDateFilterChange = useCallback(
    (filter: DateFilterType) => {
      setDateFilter(filter);
      clearSelection();
    },
    [clearSelection]
  );

  const handleCustomRangeChange = useCallback(
    (range: DateRange) => {
      setCustomRange(range);
      setDateFilter("custom");
      clearSelection();
    },
    [clearSelection]
  );

  // =========================================================================
  // HANDLERS - Bulk Payment
  // =========================================================================

  const openConfirm = useCallback(() => {
    if (selectedIds.size === 0) {
      addToast({
        title: "Thông báo",
        description: "Vui lòng chọn ít nhất một hóa đơn",
        color: "warning",
      });
      return;
    }
    setIsConfirmOpen(true);
  }, [selectedIds]);

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const executeBulkPayment = useCallback(async () => {
    setIsProcessing(true);

    const orderIds = allData
      .filter((o) => selectedIds.has(o.id))
      .map((o) => o.id);

    try {
      const updatedCount = await bulkUpdatePaymentStatus(orderIds, "DONE");

      setIsConfirmOpen(false);
      clearSelection();

      addToast({
        title: "Thành công",
        description: `Đã cập nhật thanh toán cho ${updatedCount} hóa đơn`,
        color: "success",
      });

      // Refresh data
      await onRefresh();
    } catch (error) {
      console.error("[BulkPayment] Failed:", error);
      addToast({
        title: "Lỗi",
        description: "Không thể cập nhật thanh toán hàng loạt",
        color: "danger",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [allData, selectedIds, bulkUpdatePaymentStatus, clearSelection, onRefresh]);

  // =========================================================================
  // COMPUTED
  // =========================================================================

  const selectedCount = selectedIds.size;

  const selectedTotalPrice = allData
    .filter((o) => selectedIds.has(o.id))
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // =========================================================================
  // RETURN
  // =========================================================================

  return {
    // Selection
    selectedIds,
    selectedCount,
    selectedTotalPrice,
    toggleSelect,
    toggleSelectAll,
    clearSelection,

    // Date Filter
    dateFilter,
    customRange,
    handleDateFilterChange,
    handleCustomRangeChange,
    unpaidOrders,

    // Confirm Dialog
    isConfirmOpen,
    isProcessing,
    openConfirm,
    closeConfirm,
    executeBulkPayment,
  };
}
